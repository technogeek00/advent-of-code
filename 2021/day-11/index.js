const { loadAndTransform, logger, vars } = require('../../helpers');

let grid = loadAndTransform(vars.INPUT_FILE, '\n', (line) => line.split('').map((num) => {
    return {
        flashed: false,
        energy: parseInt(num, 10)
    }
}));

let ADJACENTS = [
    {x: -1, y: -1},
    {x: -1, y: 0},
    {x: -1, y: 1},
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: 1, y: -1},
    {x: 1, y: 0},
    {x: 1, y: 1}
]

function incrementOctopus(grid, ox, oy) {
    let octopus = grid[ox][oy];
    octopus.energy += 1;

    if(octopus.energy > 9 && !octopus.flashed) {
        octopus.flashed = true;
        ADJACENTS.forEach(({x: dx, y: dy}) => {
            let x = ox + dx;
            let y = oy + dy;
            if(x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
                incrementOctopus(grid, x, y); // recursionnnn
            }
        });
    }
}

function stepGrid(grid) {
    let flashes = 0;

    // playout grid, may be recursive due to flashes
    grid.forEach((row, x) => row.forEach((_, y) => incrementOctopus(grid, x, y)));

    // reset octopi, count flashes
    return grid.reduce((flashes, row) => {
        return row.reduce((flashes, octopus) => {
            if(octopus.flashed) {
                flashes++;
                octopus.flashed = false;
                octopus.energy = 0;
            }

            return flashes;
        }, flashes);
    }, 0);
}

function gridToString(grid) {
    return grid.map((row) => {
        return row.map((octopus) => octopus.energy).join('')
    }).join('\n');
}

logger.debug(`Before Steps`);
logger.debug(gridToString(grid), '\n');

let flashes = 0;
let iterationTarget = vars.IS_GOLD ? 1000 : 100;
let allFlashed = false;
let i;
for(i = 0; i < iterationTarget && !allFlashed; i++) {
    logger.debug(`Step ${i + 1}`);

    let stepFlashes = stepGrid(grid);
    flashes += stepFlashes;
    allFlashed = stepFlashes == (grid.length * grid.length);

    logger.debug(gridToString(grid), '\n');
}

// loop stops when all flash
logger.info(`Flashes at ${i} steps ${flashes}`);
if(allFlashed) {
    logger.info(`Iteration stopped due to all flashing`);
}
