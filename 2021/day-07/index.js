const { loadAndTransform, logger, vars } = require('../../helpers');

let positions = loadAndTransform(vars.INPUT_FILE, ',', (pos) => parseInt(pos, 10));

let maxPosition = positions.reduce((max, val) => Math.max(max, val), positions[0]);

let minimumCost = -1;
let minimumPosition = -1;

for(let t = maxPosition; t >= 0; t--) {
    let movements = 0;
    positions.forEach((pos) => {
        let diff = Math.abs(t - pos);
        if(vars.IS_GOLD) {
            movements += Math.round((diff * (diff + 1)) / 2);
        } else {
            movements += diff;
        }
    });
    logger.debug(`Costs ${movements} to align to ${t}`);
    if(minimumPosition == -1 || minimumCost > movements) {
        minimumCost = movements;
        minimumPosition = t;
    }
}

logger.info(`Minimum cost is ${minimumCost} at ${minimumPosition}`);
