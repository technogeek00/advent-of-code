const { loadAndTransform, logger } = require('../../helpers');

let [drawn, ...boards] = loadAndTransform('input.txt', '\n\n');

boards = boards.map((text) => {
    let nums = new Set();
    let positions = new Map();
    let grid = text.split('\n').map((row, r) => {
        return [...row.matchAll(/\d+/g)]
            .map((item, c) => {
                let num = parseInt(item[0], 10);
                nums.add(num);
                positions.set(num, {
                    r: r,
                    c: c
                });
                return num;
            });
    });

    return {
        nums: nums,
        positions: positions,
        hits: {
            rows: [0, 0, 0, 0, 0],
            cols: [0, 0, 0, 0, 0]
        }
    }

});

drawn = drawn.split(',').map((num) => parseInt(num, 10));

logger.debug(drawn);
logger.debug(boards);

let gridWin = null;

let winningNumber = drawn.find((number) => {
    gridWin = boards.find((board) => {
        if(!board.nums.has(number)) {
            return false;
        }

        board.nums.delete(number);

        let position = board.positions.get(number);
        board.hits.rows[position.r]++;
        board.hits.cols[position.c]++;

        return board.hits.rows[position.r] == 5 || board.hits.cols[position.c] == 5;
    });

    return !!gridWin;
});

logger.debug(gridWin);

let sum = 0;
gridWin.nums.forEach((item) => {
    sum = sum + item;
});

logger.debug(`Winning Number: ${winningNumber}`);
logger.debug(`Sum: ${sum}`);
logger.info(`Value: ${sum * winningNumber}`);

