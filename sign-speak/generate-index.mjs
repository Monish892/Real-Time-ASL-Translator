import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, 'dist', 'client');
const assetsDir = path.join(clientDir, 'assets');

// Find the built assets
const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFiles = files.filter(f => f.endsWith('.js')).sort((a, b) => {
  // Put the smaller entry chunk first, then the larger vendor chunk
  const sizeA = fs.statSync(path.join(assetsDir, a)).size;
  const sizeB = fs.statSync(path.join(assetsDir, b)).size;
  return sizeA - sizeB;
});

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Signal — Real-time ASL Translator</title>
    <meta name="description" content="Translate American Sign Language gestures into text and speech in real time using your webcam." />
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <div id="root"></div>
    ${jsFiles.map(f => `<script type="module" src="/assets/${f}"></script>`).join('\n    ')}
  </body>
</html>`;

fs.writeFileSync(path.join(clientDir, 'index.html'), html);
console.log('✅ Generated index.html for SPA deployment');
console.log(`   CSS: ${cssFile}`);
console.log(`   JS:  ${jsFiles.join(', ')}`);
