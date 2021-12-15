const { loadAndTransform, logger, vars } = require('../../helpers');

let grid = loadAndTransform(vars.INPUT_FILE, '\n', (line) => line.split('').map((num) => parseInt(num, 10)));

let DIRS = [
    {
        direction: 'right',
        dx: 1,
        dy: 0
    },
    {
        direction: 'down',
        dx: 0,
        dy: 1
    },
    {
        direction: 'up',
        dx: 0,
        dy: -1
    },
    {
        direction: 'left',
        dx: 1,
        dy: 0
    }
]

let MULTIPLE = vars.IS_GOLD ? 5 : 1;

function getRiskValue(grid, x, y) {
    let multiples = {
        x: Math.floor(x / grid[0].length),
        y: Math.floor(y / grid.length)
    };
    let point = {
        x: x % grid[0].length,
        y: y % grid.length
    };
    let risk = (grid[point.y][point.x] + multiples.x + multiples.y) % 9;
    risk = risk == 0 ? 9 : risk;
    logger.debug(`Multi (${multiples.x},${multiples.y}) - Sub ${point.x},${point.y} - Risk ${risk}`);
    return risk;
}

function validPosition(grid, x, y) {
    return 0 <= x && x < grid[0].length * MULTIPLE &&
        0 <= y && y < grid.length * MULTIPLE;
}

function endPoint(grid, x, y) {
    return x == (grid[0].length * MULTIPLE) - 1 &&
        y == (grid.length * MULTIPLE) - 1;
}

function traversePath(x, y, memo, visited) {
    if(!validPosition(grid, x, y)) {
        return -1;
    }

    let cost = getRiskValue(grid, x, y);

    if(endPoint(grid, x, y)) {
        return cost;
    }

    visited.add(`${x},${y}`);

    let minimum = DIRS
        .map((dir) => {
            let visitKey = `${x + dir.dx},${y + dir.dy}`;
            let memoKey = `${x},${y}-${dir.direction}`;
            if(visited.has(visitKey)) {
                return -1;
            }
            if(!memo.has(memoKey)) {
                memo.set(memoKey, traversePath(x + dir.dx, y + dir.dy, memo, visited));
            }
            return memo.get(memoKey);
        })
        .filter((cost) => cost != -1)
        .reduce((min, cost) => {
            return min == -1 ? cost : Math.min(cost, min);
        }, -1);

    visited.delete(`${x},${y}`);

    if(minimum == -1) {
        return -1;
    }

    return cost + minimum;
}

let traversal = traversePath(0, 0, new Map(), new Set()) - grid[0][0];

logger.info(`Cheapest Path: ${traversal}`);
