let fs = require('fs');

let data = fs.readFileSync('input.txt');

let entries = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => {
        let matched = line.match(/(\d+)-(\d+) (.): (.*)/);
        return {
            first: parseInt(matched[1], 10),
            second: parseInt(matched[2], 10),
            letter: matched[3],
            passcode: matched[4]
        }
    });

let valid = [];
let invalid = [];

entries.forEach((entry) => {
    let {first, second, letter, passcode} = entry;
    let firstMatch = passcode.charAt(first - 1) == letter;
    let secondMatch = passcode.charAt(second - 1) == letter;
    if((firstMatch && !secondMatch) || (!firstMatch && secondMatch)) {
        valid.push(entry);
    } else {
        invalid.push(entry);
    }
});

console.log(`Valid Passwords: ${valid.length}`);
console.log(`Invalid Passwords: ${invalid.length}`);
