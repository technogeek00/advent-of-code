const { loadAndTransform } = require('../../helpers');

let sessions = loadAndTransform('input.txt', '\n', (line) => {
    return line.split(',').map((num) => parseInt(num, 10));
});

function spokenNumber(starting, targetTurn) {
    let turns = new Map();

    starting.forEach((num, idx) => {
        turns.set(num, {
            last: idx,
            lastLast: null
        });
    });

    let spoke = starting[starting.length - 1];
    let turn = starting.length;

    do {
        let previous = turns.get(spoke);
        if(previous.lastLast == null) {
            // first time spoken
            spoke = 0;
        } else {
            // take previous two turns and find difference
            let last = previous[previous.length - 1];
            let lastLast = previous[previous.length - 2];
            spoke = previous.last - previous.lastLast;
        }
        if(!turns.has(spoke)) {
            turns.set(spoke, {
                last: turn
            });
        } else {
            let obj = turns.get(spoke);
            obj.lastLast = obj.last;
            obj.last = turn;
        }
        turn++;
    } while(turn < targetTurn)

    return spoke;
}

sessions.forEach((session) => {
    let spoke = spokenNumber(session, 30000000); // aint fast, but it works still
    console.log(`Spoke ${spoke} for 30000000th turn of ${session}`);
})
