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
let aim = 0;

commands.forEach((command) => {
    switch(command.direction) {
        case 'forward':
            horizontal += command.count;
            depth += aim * command.count;
            break;
        case 'down':
            aim += command.count;
            break;
        case 'up':
            aim -= command.count;
            break;
    };
});

logger.info(`${horizontal} x ${depth} - ${horizontal * depth}`);
