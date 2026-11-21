const fs = require('fs');
const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
if (tokens.length >= 2) {
  let ptr = 0;
  const r = parseInt(tokens[ptr++], 10);
  const c = parseInt(tokens[ptr++], 10);
  let sum = 0;
  const mat = [];
  for (let i = 0; i < r; i++) {
    const row = [];
    for (let j = 0; j < c; j++) {
      const val = parseInt(tokens[ptr++], 10);
      sum += val;
      row.push(val);
    }
    mat.push(row);
  }
  console.log(sum);
}