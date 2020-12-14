const { loadAndTransform } = require('../../helpers');

let [availableTime, buses] = loadAndTransform('input.txt', '\n');

buses = buses.split(',')
    .filter((bus) => bus != 'x')
    .map((bus) => parseInt(bus, 10))

let earliest = -1;
let waitBus = null;

buses.forEach((bus) => {
    let remainder = availableTime % bus;
    let waiting = bus - remainder;
    if(!waitBus || earliest > waiting) {
        waitBus = bus;
        earliest = waiting;
    }
})

console.log(`Take Bus ${waitBus} waiting for ${earliest} minutes: ${waitBus * earliest}`);
