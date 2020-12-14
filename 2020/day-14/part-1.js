const { loadAndTransform } = require('../../helpers');

let commands = loadAndTransform('input.txt', '\n', (line) => {
    if(line.startsWith('mask')) {
        return line.substring(7).split('').map((char, idx) => {
            if(char == 'X') {
                return null;
            }
            return {
                position: 35 - idx,
                forced: parseInt(char, 10)
            }
        }).filter((char) => !!char);
    } else {
        let match = line.match(/^mem\[(\d+)\] = ([\d]+)$/);
        return {
            address: match[1],
            value: BigInt(parseInt(match[2], 10))
        }
    }
});


let memory = new Map();

commands.reduce((mask, cur) => {
    if(Array.isArray(cur)) {
        return cur;
    }

    // otherwise apply address operation
    let {address, value} = cur;

    let adjusted = value;

    mask.forEach((entry) => {
        let {position, forced} = entry;
        let isolation = BigInt(1) << BigInt(position);
        let remainder = adjusted & ~isolation;
        if(forced == 0) {
            adjusted = remainder & ~isolation;
        } else {
            adjusted = remainder | isolation;
        }
    })

    memory.set(address, adjusted);

    return mask;
}, null);

let sum = 0n;
for (const [addr, value] of memory) {
    sum += value;
}

console.log(`Sum: ${sum}`)
