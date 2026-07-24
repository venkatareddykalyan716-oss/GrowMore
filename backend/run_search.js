const { exec } = require('child_process');
const fs = require('fs');

exec('node "c:\\Users\\KALYAN VENKATA REDDY\\OneDrive\\Desktop\\GrowMore\\backend\\search_code.js"', (error, stdout, stderr) => {
  const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error}`;
  fs.writeFileSync('c:\\Users\\KALYAN VENKATA REDDY\\OneDrive\\Desktop\\GrowMore\\backend\\search_output.txt', output);
  console.log('Search execution done.');
});
