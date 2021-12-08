const { loadAndTransform, logger, vars, sets } = require('../../helpers');

let signals = loadAndTransform(vars.INPUT_FILE, '\n', (line) => {
    let [inputs, digits] = line.split('|');

    return {
        wires: inputs.trim().split(' ').map((wire) => new Set(wire.split(''))),
        displays: digits.trim().split(' ').map((display) => new Set(display.split('')))
    }
});

let uniqueCount = 0;
signals.forEach((signal) => {
    signal.displays.forEach((display) => {
        if([2, 3, 4, 7].indexOf(display.size) != -1) {
            uniqueCount++;
        }
    })
})

logger.info(`Digit count: ${uniqueCount}`);

if(!vars.IS_GOLD) {
    return;
}

function identifyNumbers(wires) {
    // deductive reasoning steps to identify all wires, identified wires can find unidentified
    let one = wires.find((wire) => wire.size == 2);
    let seven = wires.find((wire) => wire.size == 3);
    let four = wires.find((wire) => wire.size == 4);
    let eight = wires.find((wire) => wire.size == 7);
    let six = wires.find((wire) => wire.size == 6 && sets.intersect(one, wire).size == 1);
    let fourMinusSeven = sets.difference(four, seven);
    let nine = wires.find((wire) => wire.size == 6 && wire != six && sets.intersect(fourMinusSeven, wire).size == 2);
    let zero = wires.find((wire) => wire.size == 6 && wire != six && wire != nine);
    let three = wires.find((wire) => wire.size == 5 && sets.intersect(one, wire).size == 2);
    let two = wires.find((wire) => wire.size == 5 && sets.intersect(four, wire).size == 2);
    let five = wires.find((wire) => wire.size == 5 && wire != three && wire != two);

    // return in index order so that the index is the number
    return [
        zero,
        one,
        two,
        three,
        four,
        five,
        six,
        seven,
        eight,
        nine
    ];
}

function translateDisplay(numbers, display) {
    return numbers.findIndex((number) => display.size == number.size && sets.difference(display, number).size == 0);
}

let sum = signals.reduce((sum, signal) => {
    let numbers = identifyNumbers(signal.wires);
    let digits = signal.displays.map(translateDisplay.bind(null, numbers));

    return sum + parseInt(digits.join(''), 10);
}, 0)

logger.info(`Sum of all output values: ${sum}`);
