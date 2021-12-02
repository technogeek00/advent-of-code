const { loadAndTransform, logger } = require('../../helpers');

let commands = loadAndTransform('input.txt', '\n', (line) => {
    let matched = line.match(/(forward|down|up) (\d+)/);
    return {
        direction: matched[1],
        count: parseInt(matched[2], 10)
    };
});

let horizontal = 0;
let depth = 0;

commands.forEach((command) => {
    switch(command.direction) {
        case 'forward':
            horizontal += command.count;
            break;
        case 'down':
            depth += command.count;
            break;
        case 'up':
            depth -= command.count;
            break;
    };
});

logger.info(`${horizontal} x ${depth} - ${horizontal * depth}`);
