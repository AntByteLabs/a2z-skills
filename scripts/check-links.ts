import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LinkChecker, LinkState } from 'linkinator';

/** Serve real directory indexes so nested article links are actually crawled. */
export const checkBuiltLinks = async (directory: string) => {
  const root = resolve(directory);
  const html: string[] = [];
  const walk = async (folder: string) => {
    for (const item of await readdir(folder, { withFileTypes: true })) {
      const path = resolve(folder, item.name);
      if (item.isDirectory()) await walk(path);
      else if (item.name.endsWith('.html')) html.push(path);
    }
  };
  await walk(root);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url ?? '/', 'http://localhost').pathname,
      );
      let file = resolve(root, '.' + pathname);
      if (file !== root && !file.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      const type =
        (
          {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.xml': 'application/xml',
          } as Record<string, string>
        )[extname(file)] ?? 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': type });
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('No link-check server address');
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    const checker = new LinkChecker();
    const result = await checker.check({
      path: html.map(
        (file) =>
          origin +
          file
            .slice(root.length)
            .split(sep)
            .join('/')
            .replace(/index\.html$/, ''),
      ),
      recurse: true,
      concurrency: 8,
      timeout: 10000,
      retry: false,
      linksToSkip: async (link) =>
        !link.startsWith(origin + '/') || new URL(link).pathname.startsWith('/pagefind/'),
    });
    const broken = result.links.filter((link) => link.state === LinkState.BROKEN);
    for (const link of broken)
      console.error(`${link.status} ${link.url} (from ${link.parent ?? 'entry'})`);
    return {
      passed: result.passed,
      checked: result.links.filter((link) => link.state !== LinkState.SKIPPED).length,
      pages: html.length,
    };
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done, reject) =>
      server.close((error) => (error ? reject(error) : done())),
    );
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await checkBuiltLinks(process.argv[2] ?? 'dist');
  console.log(`links: ${result.pages} HTML pages, ${result.checked} internal destinations`);
  if (!result.passed) process.exitCode = 1;
}
