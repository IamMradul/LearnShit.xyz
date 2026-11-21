const readline = require('readline');
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\n');
if (lines.length > 0 && lines[0] !== '') {
  const n = parseInt(lines[0].trim(), 10);
  const arr = lines[1].trim().split(/\s+/).map(Number);
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += arr[i];
  }
  console.log(total);
}