const { loadAndTransform, logger } = require('../../helpers');

let directions = loadAndTransform('input.txt', '\n');

let blackTiles = new Set();

function generateKey(x, y) {
    return `${Math.floor(x / 2)},${Math.floor(y / 2)}`;
}

directions.forEach((direction) => {
    let x = 0;
    let y = 0;
    let position = 0;
    logger.debug(`Directions: ${direction}`)
    while(position < direction.length) {
        let char = direction[position];
        if(char == 'n' || char == 's') {
            char += direction[position + 1];
            position++;
        }

        logger.debug(`    Move ${char} from ${generateKey(x, y)}`);

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
                logger.info(`Unknown case: ${char}`);
                break;
        }

        logger.debug(`    Landed on ${generateKey(x, y)}`);

        position++;
    }

    let key = generateKey(x, y);

    if(blackTiles.has(key)) {
        blackTiles.delete(key);
    } else {
        blackTiles.add(key);
    }
});

logger.info(`Black tiles: ${blackTiles.size}`);
