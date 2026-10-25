/**
 * A2Z Skills MCP server.
 *
 * Every tool here edits the repository, because the repository is the source
 * of truth for the site. Nothing writes to the live Worker directly: a change
 * is a commit, and a deploy is a Workers build of that commit. That keeps the
 * history, the review and the quality gates in one place.
 *
 * Transport: Streamable HTTP. POST carries one JSON-RPC message and the reply
 * comes back as JSON, which is all a stateless server needs.
 */
import {
  commitFiles,
  deleteFile,
  listDir,
  readFile,
  startBuild,
  toBase64,
  writeFile,
  type Env,
} from './github';
import {
  PILLARS,
  TYPES,
  blueprint,
  checkPost,
  getPost,
  joinPost,
  listPostSlugs,
  postPath,
  slugify,
  splitPost,
  type Frontmatter,
} from './posts';

const SITE = 'https://a2zskillsewa.com';
const PROTOCOL_VERSION = '2025-06-18';

type Json = Record<string, unknown>;
type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

const text = (value: unknown): ToolResult => ({
  content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
});

const today = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ tools */

const tools = [
  {
    name: 'list_posts',
    description:
      'List every post in the repository with its title, pillar, type, draft state and tested date. Start here to find a slug.',
    inputSchema: {
      type: 'object',
      properties: {
        includeDrafts: { type: 'boolean', description: 'Include drafts (default true).' },
      },
    },
    handler: async (env: Env, args: Json) => {
      const slugs = await listPostSlugs(env);
      const rows = [];
      for (const slug of slugs) {
        const post = await getPost(env, slug);
        if (!post) continue;
        const f = post.frontmatter as any;
        if (args.includeDrafts === false && f.draft) continue;
        rows.push({
          slug,
          title: f.title,
          pillar: f.pillar,
          type: f.type,
          draft: f.draft ?? false,
          testedOn: f.testedOn?.date ?? null,
          url: f.draft ? null : `${SITE}/${slug}/`,
        });
      }
      return text({ count: rows.length, posts: rows });
    },
  },
  {
    name: 'get_post',
    description: 'Read one post: its frontmatter and its full body.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string' } },
      required: ['slug'],
    },
    handler: async (env: Env, args: Json) => {
      const post = await getPost(env, String(args.slug));
      if (!post) return text(`No post at src/content/posts/${args.slug}/`);
      return text({
        slug: post.slug,
        frontmatter: post.frontmatter,
        body: post.body,
        check: checkPost(post.frontmatter, post.body, post.slug),
      });
    },
  },
  {
    name: 'create_post',
    description:
      'Create a post as a draft, with a slug derived from the keyword and the blueprint headings. It is committed to main as draft: true, so nothing is published until publish_post runs.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'The phrase a reader would search for.' },
        title: { type: 'string', description: 'Defaults to the keyword, capitalised.' },
        pillar: { type: 'string', enum: [...PILLARS] },
        type: { type: 'string', enum: [...TYPES] },
        author: { type: 'string', description: 'An author id, e.g. devchandra-shrestha.' },
        description: { type: 'string', description: '120 to 160 characters.' },
        quickAnswer: { type: 'string', description: 'The answer in two or three sentences, 300 characters at most.' },
        body: { type: 'string', description: 'MDX body. Omitted means the blueprint.' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['keyword', 'pillar', 'type', 'author'],
    },
    handler: async (env: Env, args: Json) => {
      const slug = slugify(String(args.keyword));
      if (slug.split('-').length < 3)
        return text(`"${slug}" is only ${slug.split('-').length} word(s). Give a fuller keyword phrase.`);
      if (await getPost(env, slug)) return text(`A post already exists at ${slug}.`);

      const keyword = String(args.keyword);
      const frontmatter: Frontmatter = {
        title: args.title ?? keyword.charAt(0).toUpperCase() + keyword.slice(1),
        description: args.description ?? '',
        pillar: args.pillar,
        type: args.type,
        tags: args.tags ?? [],
        author: args.author,
        publishedAt: today(),
        quickAnswer: args.quickAnswer ?? '',
        faq: [],
        affiliates: [],
        downloads: [],
        draft: true,
      };
      const body = String(args.body ?? blueprint(String(args.pillar), String(args.type)));
      const check = checkPost(frontmatter, body, slug);
      const result = await writeFile(
        env,
        postPath(slug),
        joinPost(frontmatter, body),
        `Draft: ${frontmatter.title}`,
      );
      return text({
        created: slug,
        ...result,
        check,
        next:
          'Fill anything the check lists, then publish_post. A how-to, fix or review also needs testedOn before it can go live.',
      });
    },
  },
  {
    name: 'update_post',
    description:
      'Change a post. Pass frontmatter fields to merge, a new body, or both. Returns the validation result for the post as it now stands.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        frontmatter: { type: 'object', description: 'Fields to merge in. Pass null to remove one.' },
        body: { type: 'string', description: 'Replaces the body entirely.' },
        appendBody: { type: 'string', description: 'Added to the end of the body instead.' },
        message: { type: 'string', description: 'Commit message.' },
      },
      required: ['slug'],
    },
    handler: async (env: Env, args: Json) => {
      const post = await getPost(env, String(args.slug));
      if (!post) return text(`No post at ${args.slug}.`);

      const frontmatter = { ...post.frontmatter };
      for (const [k, v] of Object.entries((args.frontmatter as Json) ?? {})) {
        if (v === null) delete frontmatter[k];
        else frontmatter[k] = v;
      }
      let body = post.body;
      if (typeof args.body === 'string') body = args.body;
      if (typeof args.appendBody === 'string') body = `${body.trimEnd()}\n\n${args.appendBody}\n`;

      const check = checkPost(frontmatter, body, post.slug);
      const result = await writeFile(
        env,
        postPath(post.slug),
        joinPost(frontmatter, body),
        String(args.message ?? `Update ${post.slug}`),
      );
      return text({ updated: post.slug, ...result, check });
    },
  },
  {
    name: 'publish_post',
    description:
      'Set draft: false so the post builds into the live site. Refuses if the post fails validation, because a post that fails the gate would fail the build anyway.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        deploy: { type: 'boolean', description: 'Start a build straight away (default true).' },
      },
      required: ['slug'],
    },
    handler: async (env: Env, args: Json) => {
      const post = await getPost(env, String(args.slug));
      if (!post) return text(`No post at ${args.slug}.`);

      const frontmatter = { ...post.frontmatter, draft: false };
      const check = checkPost(frontmatter, post.body, post.slug);
      if (!check.ok) {
        return {
          ...text({
            refused: post.slug,
            problems: check.problems,
            note: 'Fix these with update_post, then publish again.',
          }),
          isError: true,
        };
      }
      const result = await writeFile(
        env,
        postPath(post.slug),
        joinPost(frontmatter, post.body),
        `Publish: ${post.frontmatter.title ?? post.slug}`,
      );
      const build = args.deploy === false ? { started: false, reason: 'deploy not requested' } : await startBuild(env);
      return text({
        published: post.slug,
        url: `${SITE}/${post.slug}/`,
        ...result,
        warnings: check.warnings,
        build,
      });
    },
  },
  {
    name: 'unpublish_post',
    description: 'Set draft: true so the post drops out of the next build.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string' }, deploy: { type: 'boolean' } },
      required: ['slug'],
    },
    handler: async (env: Env, args: Json) => {
      const post = await getPost(env, String(args.slug));
      if (!post) return text(`No post at ${args.slug}.`);
      const result = await writeFile(
        env,
        postPath(post.slug),
        joinPost({ ...post.frontmatter, draft: true }, post.body),
        `Unpublish: ${post.slug}`,
      );
      const build = args.deploy === false ? { started: false } : await startBuild(env);
      return text({ unpublished: post.slug, ...result, build });
    },
  },
  {
    name: 'upload_image',
    description:
      'Add an image to a post from base64 data or a public https URL, and set it as the hero. Attach an image in the chat and pass its data here, or paste a link. PNG, JPEG, WebP and AVIF only, 10 MB at most. Astro generates the responsive sizes at build.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'The post to attach it to.' },
        alt: { type: 'string', description: 'What the image shows, not that it is an image.' },
        base64: { type: 'string', description: 'Raw base64 of the file, no data: prefix needed.' },
        url: { type: 'string', description: 'A public https URL to fetch instead.' },
        name: { type: 'string', description: 'File name without extension. Default hero.' },
        setHero: { type: 'boolean', description: 'Set heroImage and heroAlt (default true).' },
      },
      required: ['slug', 'alt'],
    },
    handler: async (env: Env, args: Json) => {
      const post = await getPost(env, String(args.slug));
      if (!post) return text(`No post at ${args.slug}.`);

      let bytes: Uint8Array;
      let mime = '';
      if (typeof args.base64 === 'string' && args.base64) {
        const raw = args.base64.replace(/^data:([^;]+);base64,/, (_m, m1) => {
          mime = m1;
          return '';
        });
        bytes = Uint8Array.from(atob(raw.replace(/\s/g, '')), (c) => c.charCodeAt(0));
      } else if (typeof args.url === 'string' && /^https:\/\//.test(args.url)) {
        const res = await fetch(args.url, { headers: { 'User-Agent': 'a2z-skills-mcp/1.0' } });
        if (!res.ok) return text(`The host returned ${res.status} for that URL.`);
        mime = res.headers.get('content-type') ?? '';
        bytes = new Uint8Array(await res.arrayBuffer());
      } else {
        return text('Pass either base64 data or a public https url.');
      }

      if (bytes.byteLength > 10 * 1024 * 1024)
        return text(`${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB is over the 10 MB cap.`);

      // Trust the bytes, not the header: check the magic numbers.
      const sig = [...bytes.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
      const kind = sig.startsWith('89504e47')
        ? 'png'
        : sig.startsWith('ffd8ff')
          ? 'jpg'
          : sig.slice(16, 24) === '57454250'
            ? 'webp'
            : sig.slice(16, 24) === '66747970'
              ? 'avif'
              : null;
      if (!kind) return text(`Those bytes are not a PNG, JPEG, WebP or AVIF (header ${sig.slice(0, 16)}, type "${mime}").`);

      const name = String(args.name ?? 'hero').replace(/[^a-z0-9-]/gi, '') || 'hero';
      const file = `src/content/posts/${post.slug}/${name}.${kind}`;
      const base64 = toBase64(bytes);

      const files: { path: string; content: string | { base64: string } }[] = [
        { path: file, content: { base64 } },
      ];
      let frontmatter = post.frontmatter;
      if (args.setHero !== false && name === 'hero') {
        frontmatter = { ...post.frontmatter, heroImage: `./${name}.${kind}`, heroAlt: String(args.alt) };
        files.push({ path: postPath(post.slug), content: joinPost(frontmatter, post.body) });
      }

      const result = await commitFiles(env, files, `Add ${name}.${kind} to ${post.slug}`);
      return text({
        uploaded: file,
        bytes: bytes.byteLength,
        format: kind,
        heroSet: args.setHero !== false && name === 'hero',
        ...result,
        note:
          name === 'hero'
            ? 'Astro generates the AVIF and WebP sizes at build.'
            : `Use it in the body: import img from './${name}.${kind}' then <Image src={img} alt="…" />`,
      });
    },
  },
  {
    name: 'delete_post',
    description: 'Remove a post file. Add a redirect first if it was ever published.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string' }, confirm: { type: 'boolean' } },
      required: ['slug', 'confirm'],
    },
    handler: async (env: Env, args: Json) => {
      if (args.confirm !== true) return text('Pass confirm: true to delete a post.');
      const post = await getPost(env, String(args.slug));
      if (!post) return text(`No post at ${args.slug}.`);
      const wasLive = post.frontmatter.draft === false;
      const result = await deleteFile(env, postPath(post.slug), `Remove ${post.slug}`);
      return text({
        ...result,
        warning: wasLive
          ? `This post was live. Add a line to public/_redirects for /${post.slug}/ or the URL will 404.`
          : undefined,
      });
    },
  },
  {
    name: 'list_taxonomy',
    description: 'The pillars and authors a post can be assigned to.',
    inputSchema: { type: 'object', properties: {} },
    handler: async (env: Env) => {
      const authors = (await listDir(env, 'src/content/authors'))
        .filter((f) => f.name.endsWith('.json'))
        .map((f) => f.name.replace('.json', ''));
      return text({ pillars: PILLARS, types: TYPES, authors });
    },
  },
  {
    name: 'site_status',
    description:
      'What is actually live: whether the site answers, how many posts are published, and the state of the last build.',
    inputSchema: { type: 'object', properties: {} },
    handler: async (env: Env) => {
      const slugs = await listPostSlugs(env);
      let live = 0;
      let drafts = 0;
      for (const slug of slugs) {
        const post = await getPost(env, slug);
        if (!post) continue;
        if (post.frontmatter.draft) drafts += 1;
        else live += 1;
      }
      const res = await fetch(`${SITE}/`, { method: 'HEAD' }).catch(() => null);
      return text({
        site: SITE,
        reachable: res?.ok ?? false,
        status: res?.status ?? null,
        postsPublished: live,
        postsDraft: drafts,
      });
    },
  },
  {
    name: 'deploy',
    description:
      'Build and publish the current state of main to the live site. Returns how to finish the setup if Workers Builds is not connected yet.',
    inputSchema: { type: 'object', properties: {} },
    handler: async (env: Env) => text(await startBuild(env)),
  },
  {
    name: 'read_repo_file',
    description:
      'Read any file in the repository, for checking a redirect, an author record or a pillar description.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
    },
    handler: async (env: Env, args: Json) => {
      const file = await readFile(env, String(args.path));
      return file ? text(file.text) : text(`${args.path} does not exist.`);
    },
  },
  {
    name: 'write_repo_file',
    description:
      'Write any file in the repository: a redirect line, an author record, a pillar description. Use the post tools for posts.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['path', 'content'],
    },
    handler: async (env: Env, args: Json) =>
      text(
        await writeFile(
          env,
          String(args.path),
          String(args.content),
          String(args.message ?? `Update ${args.path}`),
        ),
      ),
  },
] as const;

/* -------------------------------------------------------------- transport */

const rpc = (id: unknown, result: unknown) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id: unknown, code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message },
});

const handle = async (env: Env, msg: Json): Promise<Json | null> => {
  const { method, id, params } = msg as { method: string; id?: unknown; params?: Json };

  switch (method) {
    case 'initialize':
      return rpc(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'a2z-skills', version: '1.0.0' },
        instructions:
          'Edits the A2Z Skills site by committing to its repository. Posts are created as drafts; publish_post sets draft: false and starts a build. A how-to, fix or review cannot be published without a testedOn record, because the site publishes nothing a person has not run.',
      });

    case 'notifications/initialized':
      return null;

    case 'ping':
      return rpc(id, {});

    case 'tools/list':
      return rpc(id, {
        tools: tools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      });

    case 'tools/call': {
      const name = String(params?.name);
      const tool = tools.find((t) => t.name === name);
      if (!tool) return rpcError(id, -32602, `No tool named ${name}`);
      try {
        const result = await tool.handler(env, (params?.arguments as Json) ?? {});
        return rpc(id, result);
      } catch (error) {
        return rpc(id, {
          content: [{ type: 'text', text: `${name} failed: ${(error as Error).message}` }],
          isError: true,
        });
      }
    }

    default:
      return rpcError(id, -32601, `Unsupported method: ${method}`);
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response('ok', { headers: { 'Content-Type': 'text/plain' } });
    }

    // Every tool writes to the repository or the live site, so the endpoint is
    // closed: without the bearer token it answers nothing.
    const auth = request.headers.get('Authorization') ?? '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!env.MCP_TOKEN || token !== env.MCP_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer' },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST a JSON-RPC message.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let msg: Json;
    try {
      msg = (await request.json()) as Json;
    } catch {
      return new Response(JSON.stringify(rpcError(null, -32700, 'Parse error')), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reply = await handle(env, msg);
    // A notification gets no body, only an acknowledgement.
    if (reply === null) return new Response(null, { status: 202 });
    return new Response(JSON.stringify(reply), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
