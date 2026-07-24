const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exec('git status && git log -n 10', { cwd: 'c:\\Users\\KALYAN VENKATA REDDY\\OneDrive\\Desktop\\GrowMore' }, (error, stdout, stderr) => {
  const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error}`;
  fs.writeFileSync('c:\\Users\\KALYAN VENKATA REDDY\\OneDrive\\Desktop\\GrowMore\\backend\\git_output.txt', output);
  console.log('Done');
});
