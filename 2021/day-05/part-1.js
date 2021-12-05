const { loadAndTransform, logger } = require('../../helpers');

let lines = loadAndTransform('input.txt', '\n', (line) => {
    let match = line.match(/(\d+),(\d+) -> (\d+),(\d+)/);
    return {
        x1: parseInt(match[1], 10),
        y1: parseInt(match[2], 10),
        x2: parseInt(match[3], 10),
        y2: parseInt(match[4], 10)
    }
});

let nonDiagonal = lines.filter((line) => line.x1 == line.x2 || line.y1 == line.y2);

let counts = nonDiagonal.reduce((counts, line) => {
    let { x1, y1, x2, y2 } = line;

    let pointName, dir, diff;
    if(x1 == x2) { // vertical
        dir = Math.sign(y2 - y1);
        diff = Math.abs(y2 - y1);
        pointName = (i) => `${x1}-${y1 + (dir * i)}`;
    } else { // horizontal
        dir = Math.sign(x2 - x1);
        diff = Math.abs(x2 - x1);
        pointName = (i) => `${x1 + (dir * i)}-${y1}`;
    }
    for(let i = 0; i <= diff; i++) {
        let point = pointName(i);
        if(!counts.has(point)) {
            counts.set(point, 0);
        }
        counts.set(point, counts.get(point) + 1);
    }

    return counts;
}, new Map());

let over2 = [...counts.values()].reduce(((over2, count) => count > 1 ? over2 + 1 : over2), 0);

logger.info(`Over 2 Intersect: ${over2}`);
