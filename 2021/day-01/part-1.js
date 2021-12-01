const { loadAndTransform, logger } = require('../../helpers');

let measurements = loadAndTransform('input.txt', '\n', (num) => parseInt(num, 10));

let increases = measurements
    .reduce(({prev, increases}, depth) => {
        if(!prev) {
            return {
                prev: depth,
                increases: 0
            };
        }

        if(depth > prev) {
            logger.debug(depth, '(increased)');
            increases++;
        } else {
            logger.debug(depth, '(decreased)');
        }
        return {
            prev: depth,
            increases: increases
        };
    }, {})
    .increases;

logger.info('Larger:', increases);
