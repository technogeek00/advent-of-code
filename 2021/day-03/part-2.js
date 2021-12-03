const { loadAndTransform, logger } = require('../../helpers');

let binary = loadAndTransform('input.txt', '\n');

function findByCriteria(binary, position, test) {
    let bitSize = binary[0].length;
    let ones = binary.reduce(((ones, num) => ones += num[position] == '1' ? 1 : 0), 0);
    return test(ones, binary.length - ones);
}

function findCandidate(binary, test, name) {
    let position = 0;
    while(binary.length > 1) {
        let criteriaMatch = findByCriteria(binary, position, test);
        binary = binary.filter((bin) => bin[position] == criteriaMatch);
        logger.debug(`${name} - Position ${position} - Match ${criteriaMatch} - Remaining ${binary.length}`);
        position++;
    }
    return parseInt(binary[0], 2);
}


let oxygenGenerator = findCandidate(binary.slice(), ((one, zero) => one >= zero ? '1' : '0'), 'Oxygen');
let co2Scrubber = findCandidate(binary.slice(), ((one, zero) => zero <= one ? '0' : '1'), 'Scrubber');

logger.debug(`Oxygen: ${oxygenGenerator}`);
logger.debug(`CO2 Scrubber: ${co2Scrubber}`);

logger.info(`Result: ${oxygenGenerator * co2Scrubber}`);
