const fs = require('fs');

const DEBUG = false;

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
        debug: (...message) => DEBUG ? console.log(...message) : null,
        info: (...message) => console.log(...message)
    }
}
