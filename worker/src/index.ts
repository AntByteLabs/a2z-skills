/**
 * The only server-side code on the site. It handles newsletter sign-ups and
 * hands everything else to the static assets. Sending email is deliberately
 * not here: Workers can only send to arbitrary recipients on the paid plan,
 * so addresses are collected now and mailed from a newsletter tool later.
 */

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  TURNSTILE_SECRET?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

const EMAIL = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/;

const verifyTurnstile = async (token: unknown, secret: string, ip: string | null) => {
  if (typeof token !== 'string' || !token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  if (!res.ok) return false;
  const result = (await res.json()) as { success?: boolean };
  return result.success === true;
};

/**
 * Per-IP throttle, counted in fixed windows.
 *
 * Fails open: if the table is missing or D1 is unwell, a real person still gets
 * to subscribe. A throttle that takes the form down is worse than the abuse it
 * prevents at this traffic level.
 */
const WINDOW_SECONDS = 3600;

const tooManyRequests = async (
  request: Request,
  env: Env,
  bucket: string,
  limit: number,
): Promise<boolean> => {
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  if (!ip) return false;

  // Hashed, so the table never holds an address. Truncated: collisions only
  // make the limit slightly stricter for two strangers, which is acceptable.
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const key = `${bucket}:${[...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
  const windowStart = Math.floor(Date.now() / 1000 / WINDOW_SECONDS) * WINDOW_SECONDS;

  try {
    const row = await env.DB.prepare(
      `INSERT INTO rate_limit (key, window_start, hits) VALUES (?1, ?2, 1)
       ON CONFLICT (key, window_start) DO UPDATE SET hits = hits + 1
       RETURNING hits`,
    )
      .bind(key, windowStart)
      .first<{ hits: number }>();
    return (row?.hits ?? 0) > limit;
  } catch (error) {
    console.error('rate limit check failed', error);
    return false;
  }
};

const subscribe = async (request: Request, env: Env): Promise<Response> => {
  if (await tooManyRequests(request, env, 'sub', 10))
    return json({ error: 'Too many attempts. Try again later.' }, 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Send the form as form data.' }, 400);
  }

  // Honeypot: a real person never sees this field.
  if (String(form.get('website') ?? '').trim()) return json({ ok: true });

  if (env.TURNSTILE_SECRET) {
    const ip = request.headers.get('CF-Connecting-IP');
    const ok = await verifyTurnstile(
      form.get('cf-turnstile-response'),
      env.TURNSTILE_SECRET,
      ip,
    );
    if (!ok)
      return json({ error: 'That verification did not pass. Reload and try again.' }, 400);
  }

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return json({ error: 'That does not look like an email address.' }, 400);
  }

  const sourcePath = String(form.get('path') ?? '').slice(0, 200);
  const source = String(form.get('source') ?? '').slice(0, 60);
  const magnet = String(form.get('magnet') ?? '').slice(0, 60);
  const country = request.headers.get('CF-IPCountry')?.slice(0, 2) ?? null;

  try {
    await env.DB.prepare(
      `INSERT INTO subscribers (email, source_path, source, lead_magnet, country, status)
       VALUES (?1, ?2, ?3, ?4, ?5, 'pending')
       ON CONFLICT (email) DO UPDATE SET
         source_path = excluded.source_path,
         updated_at = CURRENT_TIMESTAMP`,
    )
      .bind(email, sourcePath, source, magnet, country)
      .run();
  } catch (error) {
    console.error('subscribe insert failed', error);
    return json({ error: 'Could not save that right now. Try again in a minute.' }, 500);
  }

  // A form posted without JavaScript expects a page; fetch() expects JSON.
  const wantsJson = (request.headers.get('Accept') ?? '').includes('json');
  if (wantsJson) return json({ ok: true });
  return Response.redirect(new URL('/thanks/', request.url).toString(), 303);
};

/** Marks an address confirmed. Used once double opt-in emails start going out. */
const confirm = async (request: Request, env: Env): Promise<Response> => {
  const token = new URL(request.url).searchParams.get('t') ?? '';
  if (!/^[a-f0-9]{32,64}$/.test(token)) return json({ error: 'Bad link.' }, 400);
  const result = await env.DB.prepare(
    `UPDATE subscribers SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP
     WHERE confirm_token = ?1 AND status != 'unsubscribed'`,
  )
    .bind(token)
    .run();
  if (!result.meta.changes) return json({ error: 'That link has already been used.' }, 404);
  return Response.redirect(new URL('/thanks/', request.url).toString(), 303);
};

/**
 * A vote on whether a guide worked. No cookie, no identifier, no IP stored:
 * the only thing kept is the slug, the verdict, a country code and an optional
 * note. It exists to find the guides that do not work, which is the one thing
 * page views cannot tell you.
 */
const feedback = async (request: Request, env: Env): Promise<Response> => {
  if (await tooManyRequests(request, env, 'fb', 60))
    return json({ error: 'Too many votes.' }, 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Send the form as form data.' }, 400);
  }

  const slug = String(form.get('slug') ?? '').trim();
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return json({ error: 'Unknown page.' }, 400);

  const verdict = String(form.get('helpful') ?? '');
  if (verdict !== 'yes' && verdict !== 'no') return json({ error: 'Unknown answer.' }, 400);

  const note =
    String(form.get('note') ?? '')
      .trim()
      .slice(0, 500) || null;
  const country = request.headers.get('CF-IPCountry')?.slice(0, 2) ?? null;

  try {
    await env.DB.prepare(
      'INSERT INTO feedback (slug, helpful, country, note) VALUES (?1, ?2, ?3, ?4)',
    )
      .bind(slug, verdict === 'yes' ? 1 : 0, country, note)
      .run();
  } catch (error) {
    console.error('feedback insert failed', error);
    return json({ error: 'Could not record that.' }, 500);
  }

  return json({ ok: true });
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') return json({ error: 'POST only.' }, 405);
      return subscribe(request, env);
    }

    if (url.pathname === '/api/feedback') {
      if (request.method !== 'POST') return json({ error: 'POST only.' }, 405);
      return feedback(request, env);
    }

    if (url.pathname === '/api/confirm') {
      if (request.method !== 'GET') return json({ error: 'GET only.' }, 405);
      return confirm(request, env);
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);

    // Everything else is a static page, header rule or redirect.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
