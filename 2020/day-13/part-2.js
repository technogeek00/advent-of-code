const { loadAndTransform } = require('../../helpers');

let [availableTime, buses] = loadAndTransform('input.txt', '\n');

buses = buses.split(',')
    .map((bus, idx) => {
        if(bus == 'x') {
            return null;
        }
        return {
            cycle: parseInt(bus, 10),
            offset: idx
        }
    })
    .filter((bus) => !!bus);

let time = 0;
buses.reduce((combinedCycle, bus) => {
    for(let i = 0; i < bus.cycle; i++) {
        let next = time + i * combinedCycle;
        if((next + bus.offset) % bus.cycle == 0) {
            time = next;
            return combinedCycle * bus.cycle;
        }
    }
}, 1);

console.log(`Target Time: ${time}`)
