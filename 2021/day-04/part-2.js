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

let gridWin = null;

let winningNumber = drawn.find((number) => {
    // can be multiple winners each step
    let winners = [];

    // step all boards
    boards.forEach((board) => {
        if(!board.nums.has(number)) {
            return;
        }

        board.nums.delete(number);

        let position = board.positions.get(number);
        board.hits.rows[position.r]++;
        board.hits.cols[position.c]++;

        if(board.hits.rows[position.r] == 5 || board.hits.cols[position.c] == 5) {
            winners.push(board);
        }
    });

    // eliminate board if grid wins
    // eliminate all winning boards if there is more than 1 left
    if(winners.length > 0) {
        if(boards.length > 1) {
            logger.debug(`Eliminating ${winners.length} boards`);
            boards = boards.filter((board) => winners.indexOf(board) == -1);
        } else {
            gridWin = winners[0];
        }
    }

    return !!gridWin;
});

logger.debug(gridWin);

let sum = [...gridWin.nums].reduce((sum, num) => sum + num, 0);

logger.debug(`Winning Number: ${winningNumber}`);
logger.debug(`Sum: ${sum}`);
logger.info(`Value: ${sum * winningNumber}`);

