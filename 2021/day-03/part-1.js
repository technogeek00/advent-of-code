const { loadAndTransform, logger } = require('../../helpers');

let binary = loadAndTransform('input.txt', '\n');

let bitSize = binary[0].length;

let bits = '';
for(let pos = 0; pos < bitSize; pos++) {
    let ones = binary.reduce(((ones, num) => ones += num[pos] == '1' ? 1 : 0), 0);
    bits += ones > binary.length - ones ? '1' : '0';
}


let gamma = parseInt(bits, 2);
let epsilon = ~gamma & (Math.pow(2, bitSize) - 1);

logger.debug(`Gamma: ${gamma}`);
logger.debug(`Epsilon: ${epsilon}`);

logger.info(`Result: ${gamma * epsilon}`);
