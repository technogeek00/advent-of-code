const fs = require('fs');

function loadAndTransform(filename, splitter, transform) {
    // identity transform if unneeded
    transform = transform || ((elm) => elm);
    return fs.readFileSync(filename)
        .toString()
        .split(splitter)
        .map((line) => line.trim())
        .filter((line) => !!line)
        .map(transform)
}

module.exports = {
    loadAndTransform: loadAndTransform,
    sets: {
        intersect: (first, second) => new Set([...first].filter((x) => second.has(x))),
        difference: (first, second) => new Set([...first].filter((x) => !second.has(x)))
    }
}
