const { loadAndTransform, logger, vars } = require('../../helpers');

let lines = loadAndTransform(vars.INPUT_FILE, '\n', (line) => line.split(''));

let ILLEGAL_POINTS = {
    ')': 3,
    ']': 57,
    '}': 1197,
    '>': 25137
};

let COMPLETION_POINTS = {
    '(': 1,
    '[': 2,
    '{': 3,
    '<': 4
};

let illegalPoints = 0;
let validLines = lines.map((line) => {

    // figure out is correct
    let openStack = [];
    let badCharacter = line.find((char) => {
        switch(char) {
            case '(':
            case '[':
            case '{':
            case '<': {
                openStack.push(char);
                return false;
            }
            case ')': {
                return openStack.pop() != '(';
            }
            case ']': {
                return openStack.pop() != '[';
            }
            case '}': {
                return openStack.pop() != '{';
            }
            case '>': {
                return openStack.pop() != '<';
            }
            default: {
                logger.debug(`Invalid input: ${char}`);
                return true;
            }
        }
    });

    // check if invalid line and what the character was
    if(badCharacter) {
        logger.debug(`Invalid line found ${badCharacter}`);
        illegalPoints += ILLEGAL_POINTS[badCharacter];
        return -1;
    }

    // otherwise valid line, sum completion points
    logger.debug(`Line left to close: ${openStack.join('')}`);
    return openStack.reverse().reduce((points, char) => points * 5 + COMPLETION_POINTS[char], 0);
}).filter((points) => points != -1);

validLines.sort((a, b) => a - b);

let middlePoints = validLines[Math.floor(validLines.length / 2)];

logger.info(`Illegal Character Points: ${illegalPoints}`);
logger.info(`Middle Completion Score: ${middlePoints}`);
