const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'build') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.html'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes('guava')) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes('guava')) {
            console.log(`Found in ${fullPath}:${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log('Starting search...');
searchDir('c:\\Users\\KALYAN VENKATA REDDY\\OneDrive\\Desktop\\GrowMore');
console.log('Search finished.');
