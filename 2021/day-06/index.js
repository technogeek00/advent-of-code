const { loadAndTransform, logger } = require('../../helpers');

let PART2 = true;

let fish = loadAndTransform('input.txt', ',', (number) => parseInt(number, 10));

let fishCycles = fish.reduce((cycles, days) => {
    let count = cycles.get(days) || 0;
    cycles.set(days, count + 1);
    return cycles;
}, new Map());

logger.debug(fishCycles);

let days = PART2 ? 256 : 80;

for(let i = 0; i < days; i++) {
    let nextCycle = new Map();
    for(let d = 8; d >= 0; d--) {
        let fish = fishCycles.get(d) || 0;
        //logger.debug(`Cycle ${i} - Day ${d} - ${fish}`);
        if(fish > 0) {
            if(d > 0) {
                nextCycle.set(d - 1, fish);
            } else {
                let day6 = nextCycle.get(6) || 0;
                nextCycle.set(6, day6 + fish);
                nextCycle.set(8, fish);
            }
        }
    }
    fishCycles = nextCycle;
}

let count = [...fishCycles.values()].reduce((sum, fish) => sum + fish, 0);

logger.info(`Fish: ${count}`);
