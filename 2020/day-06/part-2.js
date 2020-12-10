const fs = require('fs');

let data = fs.readFileSync('input.txt');

let answers = data.toString()
    .split('\n\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => line
        .split('\n')
        .reduce((group, person) => {
            if(!group) {
                return new Set(person.split(''));
            }

            return new Set(person.split('').filter(a => group.has(a)))
        }, null)
    )
    .reduce((total, cur) => cur.size + total, 0);

console.log(`Answers: ${answers}`);
