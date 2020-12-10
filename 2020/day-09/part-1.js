const fs = require('fs');

const data = fs.readFileSync('input.txt');

const PREAMBLE = 25;

const nums = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => parseInt(line, 10));

let weakness = {
    idx: -1,
    value: -1
}

for(let pos = 0; pos + PREAMBLE < nums.length; pos++) {
    let preamble = nums.slice(pos, pos + PREAMBLE);
    let preSet = new Set(preamble);
    let target = nums[pos + PREAMBLE];
    let found = preamble.some((value) => preSet.has(target - value));
    if(!found) {
        weakness.idx = pos + PREAMBLE;
        weakness.value = target;
    }
}

console.log(`Ze bad number: ${weakness.idx} - ${weakness.value}`);
