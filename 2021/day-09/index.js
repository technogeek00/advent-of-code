const { loadAndTransform, logger, vars } = require('../../helpers');

let grid = loadAndTransform(vars.INPUT_FILE, '\n', (line) => line.split('').map((num) => parseInt(num, 10)));

function validPoint(grid, x, y) {
    return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length;
}

function setKey(x, y) {
    return `${x},${y}`;
}

let ADJACENTS = [
    { dx: 0,  dy: -1},
    { dx: 0,  dy: 1},
    { dx: -1, dy: 0},
    { dx: 1,  dy: 0}
];

let lowPoints = grid.reduce((lows, row, y) => {
    row.reduce((lows, value, x) => {
        let isLow = ADJACENTS
            .every(({dx, dy}) => !validPoint(grid, x + dx, y + dy) || value < grid[y + dy][x + dx])

        if(isLow) {
            lows.push({x, y, value});
        }

        return lows;
    }, lows);

    return lows;
}, []);

logger.debug(lowPoints);

let lowSum = lowPoints.reduce((sum, point) => {
    return sum + point.value + 1;
}, 0);

logger.info(`Risk sum: ${lowSum}`);

if(!vars.IS_GOLD) {
    return;
}

// compute basins
let basins = lowPoints.map((center) => {
    let centerKey = setKey(center.x, center.y);
    logger.debug(`Computing basin at ${centerKey}`);

    let points = [];

    let considered = new Set([centerKey]);
    let toCheck = [center];

    while(toCheck.length > 0) {
        let point = toCheck.shift();

        logger.debug(`Adjacent enqueue for ${setKey(point.x, point.y)}`);
        points.push(point);

        ADJACENTS.forEach(({dx, dy}) => {
            let x = point.x + dx;
            let y = point.y + dy;
            let adjacentKey = setKey(x, y);
            if(validPoint(grid, x, y) && !considered.has(adjacentKey) && grid[y][x] != 9) {
                considered.add(adjacentKey);
                toCheck.push({x, y, value: grid[y][x]});
            }
        })
    }

    return {
        center: center,
        points: points
    }
});

basins.sort((a, b) => b.points.length - a.points.length);

let multipliedLargestThree = basins
                                .slice(0, 3)
                                .reduce((mult, basin) => mult * basin.points.length, 1);

logger.debug(`Largest three sizes: ${basins.slice(0, 3).map((basin) => basin.points.length)}`)
logger.info(`Largest three multipled: ${multipliedLargestThree}`);
