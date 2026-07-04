const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match <button ...> but not those containing type=
      // We will look for <button, then capture everything up to >, check if it has type=
      const newContent = content.replace(/<button([^>]*)>/g, (match, attrs) => {
        if (attrs.includes('type=')) {
          return match;
        }
        return `<button type="button"${attrs}>`;
      });
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src/pages/xrp'));
processDir(path.join(__dirname, 'src/components/xrp'));
