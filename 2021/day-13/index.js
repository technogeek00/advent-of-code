const { loadAndTransform, logger, vars } = require('../../helpers');

let [cords, folds] = loadAndTransform(vars.INPUT_FILE, '\n\n');

function pointKey({x, y}) {
    return `${x}-${y}`;
}

function printPoints(points) {
    let maxX = -1;
    let maxY = -1;
    points.forEach((point) => {
        maxX = Math.max(point.x, maxX);
        maxY = Math.max(point.y, maxY);
    });

    let result = '';
    for(let r = 0; r <= maxY; r++) {
        for(let c = 0; c <= maxX; c++) {
            if(points.has(pointKey({x: c, y: r}))) {
                result += '#';
            } else {
                result += '.';
            }
        }
            result += '\n';
    }

    logger.info(result);
}

let points = cords
    .split('\n')
    .map((line) => {
        let [x, y] = line.split(',');
        return {
            x: parseInt(x, 10),
            y: parseInt(y, 10)
        }
    })
    .reduce((map, point) => {
        map.set(pointKey(point), point);
        return map;
    }, new Map());

folds = folds
    .split('\n')
    .map((line) => {
        let match = line.match(/fold along (x|y)=(\d+)/);
        return {
            direction: match[1],
            value: parseInt(match[2], 10)
        }
    });

// part 1 is fold once
if(!vars.IS_GOLD) {
    folds = folds.slice(0, 1);
}

folds.forEach((fold) => {
    let {direction, value} = fold;
    let newPoints = new Map();
    points.forEach((point) => {
        if(point[direction] > value) {
            point = {
                x: direction == 'x' ? 2 * value - point.x : point.x,
                y: direction == 'y' ? 2 * value - point.y : point.y
            }
        }
        newPoints.set(pointKey(point), point);
    });

    points = newPoints;
});

logger.info(`Points remaining: ${points.size}`);
printPoints(points);
return;
