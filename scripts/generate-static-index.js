const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '..', 'public', 'build', 'manifest.json');
const outPath = path.resolve(__dirname, '..', 'public', 'index.html');

function main(){
  if (!fs.existsSync(manifestPath)){
    console.error('manifest not found:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Look for the spa entry (spa-electrical.js)
  const entryKey = Object.keys(manifest).find(k => k.includes('spa-electrical.js'));
  if (!entryKey){
    console.error('spa entry not found in manifest');
    process.exit(1);
  }

  const entry = manifest[entryKey];
  const cssLinks = (entry.css || []).map(f => `<link rel="stylesheet" href="/build/${f}" />`).join('\n');
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
