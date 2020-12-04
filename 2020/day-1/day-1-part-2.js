let fs = require('fs');
let data = fs.readFileSync('day-1.txt');

let values = data
    .toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => parseInt(line, 10));

let set = new Set(values);

let sub1000 = values.filter((value) => value < 1000);

sub1000.forEach((first) => {
    sub1000.forEach((second) => {
        let remainder = 2020 - first - second;
        if(set.has(remainder)) {
            console.log(`Numbers: ${first}, ${second}, ${remainder}`);
            console.log(`Multipled: ${first * second * remainder}`);
        }
    });
});
