/**
 * The repository is the database. Everything this server changes is a commit
 * on AntByteLabs/a2z-skills, so every edit has an author, a message and a
 * revert, and the site build stays the only path to production.
 */
export type Env = {
  GITHUB_TOKEN: string;
  MCP_TOKEN: string;
  CF_API_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
  CF_BUILD_TRIGGER?: string;
};

const OWNER = 'AntByteLabs';
const REPO = 'a2z-skills';
const BRANCH = 'main';
const UA = 'a2z-skills-mcp/1.0';

/** Chunked, because spreading 130k bytes into fromCharCode overflows the stack. */
export const toBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
};

const api = async <T>(env: Env, path: string, init: RequestInit = {}): Promise<T> => {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': UA,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 400);
    throw new Error(`GitHub ${res.status} on ${path}: ${detail}`);
  }
  return (await res.json()) as T;
};

export const listDir = async (env: Env, path: string) => {
  try {
    return await api<{ name: string; path: string; type: string; sha: string }[]>(
      env,
      `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`,
    );
  } catch (error) {
    if (String(error).includes('404')) return [];
    throw error;
  }
};

export const readFile = async (env: Env, path: string) => {
  try {
    const file = await api<{ content: string; sha: string; encoding: string }>(
      env,
      `/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`,
    );
    const bytes = Uint8Array.from(atob(file.content.replace(/\n/g, '')), (c) =>
      c.charCodeAt(0),
    );
    return { text: new TextDecoder().decode(bytes), sha: file.sha };
  } catch (error) {
    if (String(error).includes('404')) return null;
    throw error;
  }
};

/** Write a text or binary file. base64 skips the UTF-8 encode for images. */
export const writeFile = async (
  env: Env,
  path: string,
  content: string | { base64: string },
  message: string,
) => {
  const existing = await readFile(env, path).catch(() => null);
  const base64 =
    typeof content === 'string'
      ? toBase64(new TextEncoder().encode(content))
      : content.base64;
  const result = await api<{ commit: { sha: string; html_url: string } }>(
    env,
    `/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: base64,
        branch: BRANCH,
        ...(existing ? { sha: existing.sha } : {}),
      }),
    },
  );
  return { path, commit: result.commit.sha.slice(0, 7), url: result.commit.html_url };
};

export const deleteFile = async (env: Env, path: string, message: string) => {
  const existing = await readFile(env, path);
  if (!existing) throw new Error(`${path} does not exist`);
  await api(env, `/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha: existing.sha, branch: BRANCH }),
  });
  return { deleted: path };
};

/**
 * Several files in one commit, so a post and its image land together and the
 * site is never built from half a change.
 */
export const commitFiles = async (
  env: Env,
  files: { path: string; content: string | { base64: string } }[],
  message: string,
) => {
  const ref = await api<{ object: { sha: string } }>(
    env,
    `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`,
  );
  const head = ref.object.sha;
  const commit = await api<{ tree: { sha: string } }>(
    env,
    `/repos/${OWNER}/${REPO}/git/commits/${head}`,
  );

  const tree = await Promise.all(
    files.map(async (f) => {
      const blob = await api<{ sha: string }>(env, `/repos/${OWNER}/${REPO}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify(
          typeof f.content === 'string'
            ? { content: f.content, encoding: 'utf-8' }
            : { content: f.content.base64, encoding: 'base64' },
        ),
      });
      return {
        path: f.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      };
    }),
  );

  const newTree = await api<{ sha: string }>(env, `/repos/${OWNER}/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: commit.tree.sha, tree }),
  });
  const newCommit = await api<{ sha: string; html_url: string }>(
    env,
    `/repos/${OWNER}/${REPO}/git/commits`,
    {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [head] }),
    },
  );
  await api(env, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  return {
    commit: newCommit.sha.slice(0, 7),
    url: newCommit.html_url,
    files: files.map((f) => f.path),
  };
};

/**
 * Deploys are automatic: Workers Builds watches main, and every tool here
 * commits to main, so a change is built and published without anything else
 * being called. An explicit build can also be started when a token is set,
 * which is only needed to republish without a change.
 */
export const startBuild = async (env: Env) => {
  const autoDeploy = {
    automatic: true,
    how: 'Workers Builds watches main. Every change made through this server is a commit to main, so it is built and deployed on its own, usually inside two minutes.',
    watch:
      'https://dash.cloudflare.com/?to=/:account/workers/services/view/a2z-skills/production/builds',
  };

  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_BUILD_TRIGGER) {
    return {
      started: false,
      ...autoDeploy,
      note: 'No build was started from here because this server has no Cloudflare API token, which it only needs to force a rebuild with no commit behind it. Nothing is waiting: the last commit is already building.',
    };
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/builds/triggers/${env.CF_BUILD_TRIGGER}/builds`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // The API needs a branch or a commit hash; an empty body is refused.
      body: JSON.stringify({ branch: BRANCH }),
    },
  );
  const body = (await res.json()) as {
    success?: boolean;
    result?: { build_uuid?: string; status?: string };
    errors?: unknown;
  };
  if (!res.ok || body.success === false) {
    return {
      started: false,
      ...autoDeploy,
      error: JSON.stringify(body.errors ?? body).slice(0, 300),
    };
  }
  return {
    started: true,
    build: body.result?.build_uuid,
    status: body.result?.status,
    ...autoDeploy,
  };
};
