const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (!input) {
  console.log('EMPTY');
} else {
  console.log('NONEMPTY');
}