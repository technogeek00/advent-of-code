const { loadAndTransform } = require('../../helpers');

let commands = loadAndTransform('input.txt', '\n', (line) => {
    if(line.startsWith('mask')) {
        return line.substring(7).split('').map((char, idx) => {
            return {
                position: 35 - idx,
                value: char
            }
        }).filter((char) => !!char);
    } else {
        let match = line.match(/^mem\[(\d+)\] = ([\d]+)$/);
        return {
            address: BigInt(match[1]),
            value: BigInt(parseInt(match[2], 10))
        }
    }
});


let memory = new Map();

commands.reduce((mask, cur) => {
    // consume the next mask
    if(Array.isArray(cur)) {
        return cur;
    }

    // otherwise we will compute the address space to apply to
    let {address, value} = cur;

    // prime address set to the initial ones
    let addresses = [address];

    mask.forEach((entry) => {
        let {position, value} = entry;
        let isolation = BigInt(1) << BigInt(position);

        switch(value) {
            case '1':
                // force this position to 1 in the address
                addresses = addresses.map((address) => {
                    return address | isolation;
                });
                break;
            case '0':
                // no change to the position in the address
                break;
            case 'X':
                // duplicate each address with a 0 and 1 option
                addresses = addresses.reduce((collect, address) => {
                    let remainder = address & ~isolation;
                    collect.push(remainder & ~isolation);
                    collect.push(remainder | isolation);
                    return collect;
                }, []);
                break;
        }
    });

    // set all addresses to value
    addresses.forEach((address) => memory.set(address, value));

    return mask;
}, null);

let sum = 0n;
for (const [addr, value] of memory) {
    sum += value;
}

console.log(`Sum: ${sum}`)
