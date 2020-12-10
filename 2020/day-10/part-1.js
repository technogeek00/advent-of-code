const fs = require('fs');

const data = fs.readFileSync('input.txt');

let adapters = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => parseInt(line, 10));

adapters.sort((a, b) => a - b);

console.log(adapters)

let differences = new Map();
differences.set(1, 0);
differences.set(2, 0);
differences.set(3, 1);

let jolts = 0;
for(var i = 0; i < adapters.length; i++) {
    let cur = adapters[i];
    let diff = cur - jolts;
    differences.set(diff, differences.get(diff) + 1);
    jolts = cur;
}

console.log(differences);

console.log(`1 x 3 differences: ${differences.get(1) * differences.get(3)}`)
