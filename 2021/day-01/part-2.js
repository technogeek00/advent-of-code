const { loadAndTransform, logger } = require('../../helpers');

let measurements = loadAndTransform('input.txt', '\n', (num) => parseInt(num, 10));

let increases = measurements
    .slice(0, -2)
    .reduce(({prev, increases}, _, idx) => {
        let cur = measurements[idx] + measurements[idx + 1] + measurements[idx + 2];
        if(!prev) {
            return {
                prev: cur,
                increases: 0
            };
        }

        let increased = cur > prev;
        if(cur > prev) {
            logger.debug(cur, '(increased)');
            increases++;
        } else {
            logger.debug(cur, '(decreased)');
        }
        return {
            prev: cur,
            increases: increases
        }
    }, {})
    .increases;

logger.info(`Larger: ${increases}`)
