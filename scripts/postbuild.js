import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist/index.html');
const rootAppPath = path.resolve('SimologyManager.html');

if (fs.existsSync(distPath)) {
  let html = fs.readFileSync(distPath, 'utf8');

  // Extract inlined script tag from <head> and place it at bottom of <body> after <div id="root">
  const scriptRegex = /<script[\s\S]*?<\/script>/i;
  const match = html.match(scriptRegex);
  if (match) {
    let scriptTag = match[0];
    // Strip type="module" and crossorigin to prevent file:/// browser CORS blocks
    scriptTag = scriptTag.replace(/<script\s+type="module"\s+crossorigin>/gi, '<script defer>');
    scriptTag = scriptTag.replace(/<script\s+crossorigin\s+type="module">/gi, '<script defer>');
    scriptTag = scriptTag.replace(/<script\s+type="module">/gi, '<script defer>');
    if (!scriptTag.startsWith('<script defer>')) {
      scriptTag = scriptTag.replace(/<script>/gi, '<script defer>');
    }

    // Remove from head
    html = html.replace(scriptRegex, '');
    // Insert after <div id="root"></div> right before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${scriptTag}\n</body>`);
    } else {
      html += `\n${scriptTag}`;
    }
  }

  fs.writeFileSync(distPath, html, 'utf8');
  fs.writeFileSync(rootAppPath, html, 'utf8');
  console.log('✅ Generated standalone offline HTML files:');
  console.log('   - dist/index.html');
  console.log('   - SimologyManager.html (Double-click ready in root folder!)');
} else {
  console.error('❌ dist/index.html not found');
}
