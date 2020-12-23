const { loadAndTransform, logger } = require('../../helpers');

let [cups] = loadAndTransform('input.txt', '\n', (ordering) => ordering.split(''))

cups = cups.map((cup) => parseInt(cup, 10));

let max = cups.reduce((max, cur) => Math.max(max, cur), -1);
let min = cups.reduce((min, cur) => Math.min(min, cur), max);

let turns = 100;

for(let i = 0; i < turns; i++) {
    logger.debug(`-- move ${i + 1} --`);
    logger.debug(`cups: ${serializeCups(cups)}`);
    let current = cups.shift();
    let picked = cups.splice(0, 3);
    let destination = current - 1;
    let placement;
    while((placement = cups.indexOf(destination)) == -1) {
        destination--;
        if(destination < min) {
            destination = max;
        }
    }
    logger.debug(`pick up: ${picked}`);
    logger.debug(`destination: ${destination}`);

    cups.splice.apply(cups, [placement + 1, 0].concat(picked));
    cups.push(current);
}

function serializeCups(cups) {
    return cups.map((cup, idx) => idx == 0 ? `(${cup})` : `${cup}`).join(' ');
}

logger.debug('-- final --');
logger.debug(`cups: ${serializeCups(cups)}`);

while(cups[0] != 1) {
    cups.push(cups.shift());
}

logger.info(`Label: ${cups.slice(1).join('')}`)
