const { loadAndTransform } = require('../../helpers');

let startingPlane = loadAndTransform('input.txt', '\n', (line) => line.split(''));

let DIMENSIONS = 4;

function generateDimensions(size, func) {
    let dimensions = [];
    for(let i = 0; i < size; i++) {
        dimensions.push(func(i));
    }
    return dimensions;
}

function dimensionWalk(dimensions, func) {
    let position = dimensions.map((dimension) => dimension.low);
    let complete = false;
    while(!complete) {
        func(position);

        // move forward in walk
        incr = 0;
        while(incr < position.length) {
            position[incr]++;
            if(position[incr] == dimensions[incr].high) {
                position[incr] = dimensions[incr].low;
                incr++;
            } else {
                break;
            }
        }

        complete = incr == position.length;
    }
}

let HIGHER_DIMENSIONS = ['z', 'w', '5', '6', '7', '8', '9'];
function printCube(cube) {
    let buffer = "";
    dimensionWalk(cube.dimensions, (position) => {
        let key = position.join(',');
        buffer += (cube.data.has(key) && cube.data.get(key)) ? '#' : '.';

        if(position[0] == cube.dimensions[0].high - 1) {
            // lowest dimension about to roll
            buffer += "\n";

            // check if 2nd lowest will roll as well
            if(position[1] == cube.dimensions[1].high - 1) {
                // about to flip to new 2-dim grid, print buffer
                let title = position.slice(2).map((val, idx) => `${HIGHER_DIMENSIONS[idx]}=${val}`).join(', ');
                console.log(title);
                console.log(buffer);
                buffer = "";
            }
        }
    });
}

let activeBounds = generateDimensions(DIMENSIONS, (idx) => ({low: -1, high: 2}));
function isActive(target, data) {
    let activeNeighbors = 0;
    dimensionWalk(activeBounds, (position) => {
        if(!position.every((val) => val == 0)) {
            // ensure we don't evaluate ourself
            let key = position.map((val, idx) => val + target[idx]).join(',');
            if(data.has(key) && data.get(key)) {
                activeNeighbors++;
            }
        }
    });

    let active = data.get(target.join(','));

    return activeNeighbors == 3 || (active && activeNeighbors == 2);
}

function stepCycle(state) {
    let next = {
        dimensions: generateDimensions(DIMENSIONS, (idx) => ({low: state.dimensions[idx].low, high: state.dimensions[idx].high})),
        data: new Map()
    };

    let walkingDimensions = generateDimensions(DIMENSIONS, (idx) => ({low: state.dimensions[idx].low - 1, high: state.dimensions[idx].high + 1}));

    dimensionWalk(walkingDimensions, (position) => {
        let active = isActive(position, state.data);
        next.data.set(position.join(','), active);
        if(active) {
            next.dimensions.forEach((dimension, idx) => {
                dimension.low = Math.min(dimension.low, position[idx]);
                dimension.high = Math.max(dimension.high, position[idx] + 1);
            });
        }
    });

    return next;
}

let state = {
    dimensions: generateDimensions(DIMENSIONS, (idx) => ({low: 0, high: idx < 2 ? startingPlane.length : 1})),
    data: startingPlane.reduce((map, row, y) => {
        return row.reduce((map, entry, x) => {
            let key = [x, y];
            while(key.length < DIMENSIONS) {
                key.push(0);
            }
            map.set(key.join(','), entry == '#');
            return map;
        }, map);
    }, new Map())
}

// simulate 6 cycles
for(let cycles = 0; cycles < 6; cycles++) {
    state = stepCycle(state);
}

let activeCubes = 0;
state.data.forEach((active, key) => activeCubes += active ? 1 : 0);

console.log(`Active Cubes in ${DIMENSIONS} dimensions: ${activeCubes}`);
