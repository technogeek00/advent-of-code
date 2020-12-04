let fs = require('fs');

let data = fs.readFileSync('input.txt');

let lines = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line);

let trees = 0;

let xStep = 3;
let yStep = 1;

let x = 0;

for(let y = 0; y < lines.length; y += yStep) {
    let line = lines[y];
    if(line.charAt(x % line.length) == '#') {
        trees++;
    }
    x += xStep;
}

console.log(`Trees Hit: ${trees}`);
