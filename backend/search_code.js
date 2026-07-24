const fs = require('fs');
const path = require('path');

const keywords = ['salt', 'payu', 'easebuzz', 'jwpay', 'zo', 'tompay'];

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'build') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.md'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        keywords.forEach(kw => {
          if (line.toLowerCase().includes(kw)) {
            console.log(`Found "${kw}" in ${fullPath}:${index + 1}: ${line.trim()}`);
          }
        });
      });
    }
  }
}

console.log('Starting search...');
searchDir('c:\\Users\\KALYAN VENKATA REDDY\\OneDrive\\Desktop\\GrowMore');
console.log('Search finished.');
