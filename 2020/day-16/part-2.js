const { loadAndTransform } = require('../../helpers');

let [fields, yourTicket, nearbyTickets] = loadAndTransform('input.txt', '\n\n', (group) => group);

function parseRange(range) {
    let [low, high] = range.split('-').map((elm) => parseInt(elm, 10));
    return {
        low: low,
        high: high
    }
}

fields = fields.split('\n')
    .map((line) => {
        let [name, ranges] = line.split(':');
        let [lower, higher] = ranges.split(' or ');
        return {
            name: name,
            ranges: [parseRange(lower), parseRange(higher)]
        };
    });

function rangeContains(range, num) {
    return range.low <= num && num <= range.high;
}

function inRanges(field, num) {
    return field.ranges.some((range) => rangeContains(range, num));
}

function intersectSet(first, second) {
    return new Set([...first].filter((x) => second.has(x)));
}

function differenceSet(first, second) {
    return new Set([...first].filter((x) => !second.has(x)));
}

function intersectPositions(options, target) {
    let running = options[0][target];
    for(let i = 1; i < options.length; i++) {
        running = intersectSet(running, options[i][target]);
    }
    return running;
}

let validTickets = nearbyTickets
    .split('\n')
    .slice(1)
    .map((ticket) => ticket.split(',').map((num) => parseInt(num, 10)))
    .filter((ticket) => {
        return ticket.every((num) => fields.some((field) => inRanges(field, num)));
    });

yourTicket = yourTicket
    .split('\n')
    .slice(1)
    .map((ticket) => ticket.split(',').map((num) => parseInt(num, 10)))[0]

// dont forget to use your valid ticket!
validTickets.push(yourTicket);

let ticketOptions = validTickets
    .map((ticket) => {
        return ticket.map((num) => {
            let possible = fields.filter((field) => inRanges(field, num))
                .map((field) => field.name);
            return new Set(possible);
        });
    });

// start with all positions to process
let toProcess = ticketOptions[0].map((num, idx) => idx);
let namedPositions = [];
let allocated = new Set();

// since we use different positions to take away options we will
// have to use a queue of positions to process and may process them
// more than once
while(toProcess.length > 0) {
    let target = toProcess.shift();

    // generate candidate list
    let candidates = intersectPositions(ticketOptions, target);
    // exclude already allocated
    candidates = differenceSet(candidates, allocated);

    if(candidates.size == 1) {
        // we found an answer!
        let [result] = [...candidates];
        namedPositions.push({
            idx: target,
            name: result
        });
        allocated.add(result);
    } else {
        // no answer push to back of processing
        toProcess.push(target)
    }
}

// Now that we have the named positions we can compute the departure value
let departure = namedPositions.reduce((total, position) => {
    if(position.name.startsWith('departure')) {
        total *= yourTicket[position.idx];
    }
    return total;
}, 1);

console.log(`Departure Value: ${departure}`)
