import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../docs', import.meta.url));
const base = '/reaction-diffusion-patternmaker';
const port = Number(process.env.PORT ?? 4174);

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
]);

function resolvePath(url) {
  const pathname = new URL(url, `http://127.0.0.1:${port}`).pathname;
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
  const candidate = normalize(join(root, relative));
  if (!candidate.startsWith(root)) return join(root, '404.html');
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) return join(candidate, 'index.html');
  return join(root, '404.html');
}

const server = createServer((req, res) => {
  const file = resolvePath(req.url ?? '/');
  res.setHeader('Content-Type', types.get(extname(file)) ?? 'application/octet-stream');
  createReadStream(file)
    .on('error', () => {
      res.writeHead(404);
      res.end('Not found');
    })
    .pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Pages preview: http://127.0.0.1:${port}${base}/`);
});
