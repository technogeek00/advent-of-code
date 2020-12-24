const { loadAndTransform, logger } = require('../../helpers');

let directions = loadAndTransform('input.txt', '\n');


function initialKeyForm(x, y) {
    return `${Math.floor(x / 2)},${Math.floor(y / 2)}`;
}

function stepKeyForm(x, y) {
    return `${x},${y}`;
}

function synthesisStart(directions) {
    let bounds = {
        x: {
            min: 0,
            max: 0,
        },
        y: {
            min: 0,
            max: 0
        }
    };

    let blackTiles = new Set();

    directions.forEach((direction) => {
        let x = 0;
        let y = 0;
        let position = 0;
        while(position < direction.length) {
            let char = direction[position];
            if(char == 'n' || char == 's') {
                char += direction[position + 1];
                position++;
            }

            switch(char) {
                case 'e':
                    x+=2;
                    break;
                case 'se':
                    x++;
                    y-=2;
                    break;
                case 'sw':
                    x--;
                    y-=2;
                    break;
                case 'w':
                    x-=2;
                    break;
                case 'nw':
                    x--;
                    y+=2;
                    break;
                case 'ne':
                    x++;
                    y+=2;
                    break;
                default:
                    break;
            }

            position++;
        }

        let key = initialKeyForm(x, y);

        if(blackTiles.has(key)) {
            blackTiles.delete(key);
        } else {
            blackTiles.add(key);
        }

        bounds.x.min = Math.min(bounds.x.min, Math.floor(x / 2));
        bounds.x.max = Math.max(bounds.x.max, Math.floor(x / 2));
        bounds.y.min = Math.min(bounds.y.min, Math.floor(y / 2));
        bounds.y.max = Math.max(bounds.y.max, Math.floor(y / 2));
    });

    return {
        floor: blackTiles,
        bounds: bounds
    }
}

function countAdjacent(floor, x, y) {
    let evenRow = Math.abs(y) % 2 == 0;
        // for even rows, east is the same for ne/se
        // for odd rows, west is the same for nw/sw
    return adjacent = [
            {name: 'ne',x: evenRow ? 0 : 1, y: 1},     // ne
            {name: 'nw',x: evenRow ? -1 : 0, y: 1},    // nw
            {name: 'e',x: 1, y: 0},     // e
            {name: 'w',x: -1, y: 0},    // w
            {name: 'se',x: evenRow ? 0 : 1, y: -1},    // se
            {name: 'sw',x: evenRow ? -1 : 0, y: -1}    // sw
        ]
        .map((offset) => {
            let key = stepKeyForm(offset.x + x, offset.y + y);
            return key;
        })
        .reduce((total, key) => total + (floor.has(key) ? 1 : 0), 0);
}

function printFloor(floor, bounds) {
    let buffer = '    ';
    for(let i = bounds.x.min; i <= bounds.x.max; i++) {
        buffer += ' ' + `${i}`.padStart(2, ' ') + ' ';
    }
    buffer += '\n';
    for(let y = bounds.y.max; y >= bounds.y.min; y--) {
        buffer += ' ' + `${y}`.padStart(2, ' ') + ' ';
        if(Math.abs(y) % 2 == 1) {
            buffer += '  ';
        }
        for(let x = bounds.x.min; x <= bounds.x.max; x ++) {
            let key = stepKeyForm(x, y);
            let isBlack = floor.has(key);
            buffer += isBlack ? ' ## ' : ' .. ';
        }
        buffer += '\n';
    }

    logger.debug(buffer);
}

function stepFloor(floor, bounds) {
    let nextBounds = {
        x: {
            min: 0,
            max: 0
        },
        y: {
            min: 0,
            max: 0
        }
    };

    let nextFloor = new Set();

    for(let x = bounds.x.min - 1; x <= bounds.x.max + 1; x++) {
        for(let y = bounds.y.min - 1; y <= bounds.y.max + 1; y++) {
            let key = stepKeyForm(x, y);
            let isBlack = floor.has(key);
            let blackAdjacent = countAdjacent(floor, x, y);
            let flipBlack = (isBlack && (blackAdjacent > 0 && blackAdjacent <= 2)) ||
                (!isBlack && blackAdjacent == 2);
            //logger.debug(`${key} - is ${isBlack ? 'black' : 'white'} - with ${blackAdjacent} black neighbors - will be ${flipBlack ? 'black' : 'white'}`);
            if(flipBlack) {
                nextFloor.add(key);

                nextBounds.x.min = Math.min(x, nextBounds.x.min);
                nextBounds.x.max = Math.max(x, nextBounds.x.max);
                nextBounds.y.min = Math.min(y, nextBounds.y.min);
                nextBounds.y.max = Math.max(y, nextBounds.y.max);
            }
        }
    }

    return {
        floor: nextFloor,
        bounds: nextBounds
    }
}

let printBounds = {
    x: {
        min: -5,
        max: 5
    },
    y: {
        min: -5,
        max: 5
    }
}


let { floor, bounds } = synthesisStart(directions);

for(let i = 0; i < 100; i++) {
    let step = stepFloor(floor, bounds);
    floor = step.floor;
    bounds = step.bounds;
}

logger.info(`Black tiles after 100 days: ${floor.size}`)
