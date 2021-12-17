const { loadAndTransform, logger, vars } = require('../../helpers');

let [input] = loadAndTransform(vars.INPUT_FILE, '\n');

let match = input.match(/x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/);

let target = {
    x: {
        min: parseInt(match[1], 10),
        max: parseInt(match[2], 10)
    },
    y: {
        min: parseInt(match[3], 10),
        max: parseInt(match[4], 10)
    }
};

function pointAtStep(iv, step, cap = false) {
    let land = ((iv + 1) * iv) / 2;
    if(step >= iv && cap) {
        return land;
    }
    let diff = ((iv + 1 - step) * (iv - step)) / 2;
    return land - diff;
}

let maxDy = Math.abs(target.y.min) - 1;
let maxY = pointAtStep(maxDy, maxDy);
logger.info(`Y Max: ${maxY}`);

if(!vars.IS_GOLD) {
    return;
}

function hitsArea(dx, dy, target) {
    let step = 1;
    let x = 0;
    let y = 0;
    while(x <= target.x.max && y >= target.y.min) {
        x = pointAtStep(dx, step, true);
        y = pointAtStep(dy, step);
        if(x >= target.x.min && x <= target.x.max &&
           y <= target.y.max && y >= target.y.min) {
            return true;
        }
        step++;
    }
    // never hits in the square
    return false;
}

let hits = 0;
for(let dx = 0; dx <= target.x.max; dx++) {
    for(let dy = target.y.min; dy <= maxDy; dy++) {
        if(hitsArea(dx, dy, target)) {
            hits++;
        }
    }
}

logger.info(`Initial positions that hit: ${hits}`);
