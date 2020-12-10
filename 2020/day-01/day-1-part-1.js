let fs = require('fs');
let data = fs.readFileSync('day-1.txt');

let values = data
    .toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => parseInt(line, 10));

let set = new Set(values);

let result = values.find((value) => set.has(2020-value));

console.log(`Numbers: ${result}, ${2020 - result}`);
console.log(`Multipled: ${result * (2020 - result)}`);
