import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist', 'client');
const manifestPath = path.join(distDir, '.vite', 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Manifest not found at ${manifestPath}. Run the client build first.`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = Object.values(manifest).filter((value) => value.isEntry && typeof value.file === 'string');
const entry =
  entries.find((value) => typeof value.src === 'string' && value.src.endsWith('/src/main.tsx')) ||
  entries.find((value) => typeof value.src === 'string' && value.src.endsWith('main.tsx')) ||
  entries[0];

if (!entry) {
  throw new Error('No entry point found in manifest.');
}

const cssLinks = Array.isArray(entry.assets)
  ? entry.assets
      .filter((asset) => asset.endsWith('.css'))
      .map((asset) => `<link rel="stylesheet" href="/${asset}" />`)
      .join('\n    ')
  : '';

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NOC</title>
    ${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entry.file}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml, 'utf8');
console.log(`Generated ${path.join(distDir, 'index.html')} using ${entry.file}`);
