import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist/index.html');
const rootAppPath = path.resolve('SimologyManager.html');

if (fs.existsSync(distPath)) {
  const html = fs.readFileSync(distPath, 'utf8');
  const assetsDir = path.resolve('dist/assets');
  let jsCode = '';
  let cssCode = '';

  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    for (const file of files) {
      if (file.endsWith('.js')) {
        jsCode += fs.readFileSync(path.join(assetsDir, file), 'utf8') + '\n';
      } else if (file.endsWith('.css')) {
        cssCode += fs.readFileSync(path.join(assetsDir, file), 'utf8') + '\n';
      }
    }
  }

  // Create standalone double-clickable offline HTML file without touching dist/index.html
  let standaloneHtml = html;
  if (cssCode) {
    standaloneHtml = standaloneHtml.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, `<style>${cssCode}</style>`);
  }
  if (jsCode) {
    standaloneHtml = standaloneHtml.replace(/<script[^>]+src=["'][^"']*assets\/[^"']*\.js["'][^>]*><\/script>/gi, '');
    standaloneHtml = standaloneHtml.replace('</body>', `<script defer>${jsCode}</script>\n</body>`);
  }

  fs.writeFileSync(rootAppPath, standaloneHtml, 'utf8');
  console.log('✅ Standard production dist/ build preserved for Google AI Studio Cloud Run & GitHub Pages');
  console.log('✅ Self-contained SimologyManager.html generated for local double-clicking');
} else {
  console.error('❌ dist/index.html not found');
}
