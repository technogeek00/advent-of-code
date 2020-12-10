let fs = require('fs');

let data = fs.readFileSync('input.txt');

function binarySearch(low, high, decisions, lower) {
    for(var i = 0; i < decisions.length; i++) {
        let distance = high - low + 1;
        let half = Math.floor(distance / 2);
        if(decisions.charAt(i) == lower) {
            high = high - half;
        } else {
            low = low + half;
        }
    }

    if(low != high) {
        console.log(`low: ${low}`);
        console.log(`high: ${high}`);
        console.log(`decisions: ${decisions}`);
    }
    return low;
}

let passes = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => {
        let row = binarySearch(0, 127, line.substring(0, 7), 'F');
        let column = binarySearch(0, 7, line.substring(7), 'L');
        return {
            pass: line,
            row: row,
            column: column,
            id: row * 8 + column
        }
    });

let highest = passes.reduce(((max, cur) => Math.max(max, cur.id)), -1);

console.log(`Highest: ${highest}`);
