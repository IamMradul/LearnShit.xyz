const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
  const reversed = input.split('').reverse().join('');
  console.log(reversed);
}