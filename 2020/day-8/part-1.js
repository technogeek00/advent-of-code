const fs = require('fs');

const data = fs.readFileSync('input.txt');

const instructions = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line, idx) => {
        let [instr, val] = line.split(' ');
        return {
            idx: idx,
            instr: instr,
            val: parseInt(val, 10)
        }
    })

let exec = new Set();
let accum = 0;

let next = 0;
while(!exec.has(next)) {
    exec.add(next);
    let {instr, val} = instructions[next];

    switch(instr) {
        case 'jmp':
            next += val;
            break;
        case 'acc':
            accum += val;
        case 'nop':
            next++;
            break;
    }
}

console.log(`Accum: ${accum}`);
