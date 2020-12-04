let fs = require('fs');

let data = fs.readFileSync('input.txt');

let entries = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => {
        let matched = line.match(/(\d+)-(\d+) (.): (.*)/);
        return {
            min: parseInt(matched[1], 10),
            max: parseInt(matched[2], 10),
            letter: matched[3],
            passcode: matched[4]
        }
    });

let valid = [];
let invalid = [];

entries.forEach((entry) => {
    let count = [].reduce.call(entry.passcode, (count, letter) => {
        if(letter == entry.letter) {
            return count + 1;
        }
        return count;
    }, 0);

    if(entry.min <= count && count <= entry.max) {
        valid.push(entry);
    } else {
        invalid.push(entry);
    }
});

console.log(`Valid Passwords: ${valid.length}`);
console.log(`Invalid Passwords: ${invalid.length}`);
