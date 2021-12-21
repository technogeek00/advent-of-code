const fs = require('fs');

const IS_DEBUG = process.argv.indexOf('--debug') != -1;
const IS_GOLD = process.argv.indexOf('--gold') != -1;

let inputFile = process.argv.indexOf('--real') != -1 ? 'input.txt' : 'test.txt';
let inputArg = process.argv.indexOf('--input');
if(inputArg != -1) {
    inputFile = process.argv[inputArg + 1];
}

console.debug(`${IS_DEBUG ? '[DEBUG] ' : ''}Initiating ${IS_GOLD ? 'gold' : 'silver'} run with ${inputFile}`);

const identityTransform = (elm) => elm;

function loadAndTransform(filename, splitter, transform) {
    // identity transform if unneeded
    transform = transform || identityTransform;
    return fs.readFileSync(filename)
        .toString()
        .split(splitter)
        .map((line) => line.trim())
        .filter((line) => !!line)
        .map(transform)
}

function splitAndClean(input, splitter) {
    return input.split(splitter)
        .map((item) => item.trim())
        .filter((item) => !!item)
}

module.exports = {
    loadAndTransform: loadAndTransform,
    splitAndClean: splitAndClean,
    sets: {
        intersect: (first, second) => new Set([...first].filter((x) => second.has(x))),
        difference: (first, second) => new Set([...first].filter((x) => !second.has(x)))
    },
    logger: {
        debug: (...message) => IS_DEBUG ? console.log(...message) : null,
        info: (...message) => console.log(...message)
    },
    vars: {
        IS_DEBUG: IS_DEBUG,
        IS_GOLD: IS_GOLD,
        INPUT_FILE: inputFile
    }
}
