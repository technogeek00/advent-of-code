const fs = require('fs');

let data = fs.readFileSync('input.txt');

let answers = data.toString()
    .split('\n\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => line
        .split('\n')
        .reduce((group, person) => {
            person.split('')
                .forEach((a) => group.add(a))
            return group
        }, new Set())
    )
    .reduce((total, cur) => cur.size + total, 0);

console.log(`Answers: ${answers}`);
