let fs = require('fs');

let data = fs.readFileSync('input.txt');

let lines = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line);

function treesHit(xStep, yStep) {
    let trees = 0;

    let x = 0;

    for(let y = 0; y < lines.length; y += yStep) {
        let line = lines[y];
        if(line.charAt(x % line.length) == '#') {
            trees++;
        }
        x += xStep;
    }

    return trees;
}

let slopes = [
    [1, 1],
    [3, 1],
    [5, 1],
    [7, 1],
    [1, 2]
];

let trees = slopes.map((slope) => treesHit(slope[0], slope[1]));

console.log(trees);

let multipled = trees.reduce(((mult, val) => mult * val), 1);
console.log(`Multipled Value: ${multipled}`);
