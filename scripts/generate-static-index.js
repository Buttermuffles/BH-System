import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.resolve(__dirname, '..', 'public', 'build', 'manifest.json');
const outPath = path.resolve(__dirname, '..', 'public', 'index.html');

function main(){
  if (!fs.existsSync(manifestPath)){
    console.error('manifest not found:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Look for the spa entry (spa-electrical.jsx) or fallback to app.jsx
  let entryKey = Object.keys(manifest).find(k => k.includes('spa-electrical.jsx'));
  if (!entryKey) {
    entryKey = Object.keys(manifest).find(k => k.includes('app.jsx'));
  }
  if (!entryKey){
    console.error('No entry found in manifest');
    process.exit(1);
  }

  const entry = manifest[entryKey];

  // Collect CSS files from the entry and any imported modules (recursively)
  function collectCssFiles(key, seen = new Set()){
    if (!key || seen.has(key)) return [];
    seen.add(key);
    const m = manifest[key];
    let files = [];
    if (m && m.css) files = files.concat(m.css);
    if (m && m.imports) {
      m.imports.forEach(i => {
        files = files.concat(collectCssFiles(i, seen));
      });
    }
    return files;
  }

  const cssFiles = Array.from(new Set(collectCssFiles(entryKey)));
  const cssLinks = cssFiles.map(f => `<link rel="stylesheet" href="/build/${f}" />`).join('\n');
  const jsScripts = [];

  // include the entry file and any imports (they reference other assets/have prefetched tags)
  if (entry.file) jsScripts.push(entry.file);
  (entry.imports || []).forEach(i => {
    const m = manifest[i];
    if (m && m.file && !jsScripts.includes(m.file)) jsScripts.push(m.file);
  });

  const scriptTags = jsScripts.map(f => `<script type="module" src="/build/${f}"></script>`).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Electrical Bill Receipt</title>
  ${cssLinks}
</head>
<body>
  <div id="app"></div>
  ${scriptTags}
</body>
</html>`;

  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Generated static index at', outPath);
}

main();
