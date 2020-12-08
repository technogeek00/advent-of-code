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

function simulateRun(changeStep) {

    let exec = new Set();
    let accum = 0;
    let next = 0;
    while(!exec.has(next) && next < instructions.length) {
        exec.add(next);
        let {instr, val} = instructions[next];

        if(next == changeStep) {
            if(instr == 'jmp') {
                instr = 'nop';
            } else {
                instr = 'jmp';
            }
        }

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

    let success = next == instructions.length;
    if(success) {
        console.log(`Accum value: ${accum}`);
    }
    return success;
}

// instructions to attempt
let testFix = instructions.filter((line) => line.instr != 'acc')
    .map((line) => line.idx);

testFix.find(simulateRun);
