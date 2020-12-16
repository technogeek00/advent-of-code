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

let invalid = nearbyTickets.split('\n').slice(1).reduce((invalid, ticket) => {
    return ticket
        .split(',')
        .map((num) => parseInt(num, 10))
        .reduce((invalid, num) => {
            if(!fields.some((field) => inRanges(field, num))) {
                invalid.push(num);
            }
            return invalid;
        }, invalid)
}, [])

let errorRate = invalid.reduce((total, item) => total + item, 0);

console.log(`Ticket Scanning Error Rate: ${errorRate}`)
