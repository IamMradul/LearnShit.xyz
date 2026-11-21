const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
if (input.length > 0 && input[0] !== '') {
  const n = parseInt(input[0], 10);
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += parseInt(input[i], 10);
  }
  console.log(sum);
}