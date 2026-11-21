const fs = require('fs');
const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
if (tokens.length > 0 && tokens[0] !== '') {
  let ptr = 0;
  const t = parseInt(tokens[ptr++], 10);
  for (let c = 0; c < t; c++) {
    const n = parseInt(tokens[ptr++], 10);
    let maxVal = -Infinity;
    for (let i = 0; i < n; i++) {
      const val = parseInt(tokens[ptr++], 10);
      if (val > maxVal) maxVal = val;
    }
    console.log(maxVal);
  }
}