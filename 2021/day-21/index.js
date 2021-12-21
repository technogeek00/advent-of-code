const { loadAndTransform, logger, vars } = require('../../helpers');

let [one, two] = loadAndTransform(vars.INPUT_FILE, '\n', (player) => {
    let [_, num] = player.split(': ');
    return {
        position: parseInt(num, 10) - 1,
        score: 0
    }
});

let deterministicDie = 0;
function deterministicDiceRoll() {
    return (deterministicDie++ % 100) + 1;
}

function deterministicPlay(one, two) {
    let turn = 1;

    while(one.score < 1000 && two.score < 1000) {
        let rolls = [deterministicDiceRoll(), deterministicDiceRoll(), deterministicDiceRoll()].reduce((sum, val) => sum + val, 0);

        let person = turn % 2 == 1 ? one : two;
        let next = (person.position + rolls) % 10;
        logger.debug(`Person ${person == one ? 1 : 2} rolled ${rolls} and moved to ${next + 1} with score ${person.score + next + 1}`);
        person.position = next;
        person.score += next + 1;
        turn++;
    }

    let loser = one.score >= 1000 ? two : one;

    logger.info(`Deterministic game complete`);
    logger.info(`    Person 1: ${one.score}`);
    logger.info(`    Person 2: ${two.score}`);
    logger.info(`Person ${loser == one ? 1 : 2} score (${loser.score}) * rolls (${deterministicDie}): ${loser.score * deterministicDie}`);
}

let QUANTUM_FRACTURES = [
  3, 4, 5, 4, 5, 6, 5, 6,
  7, 4, 5, 6, 5, 6, 7, 6,
  7, 8, 5, 6, 7, 6, 7, 8,
  7, 8, 9
].reduce((collected, digit) => {
    let count = collected.get(digit) || 0;
    collected.set(digit, count + 1);
    return collected;
}, new Map());

// key mapping function for a game, allows us to track when universes collide into one another
function k(game) {
    return `${game.turn % 2}-${game.one.position}-${game.one.score}-${game.two.position}-${game.two.score}`;
}

function quantumPlay(one, two) {
    let games = new Map();

    let game = {
        turn: 1,
        copies: 1,
        one: one,
        two: two
    };

    games.set(k(game), game);

    let wins = {
        one: 0,
        two: 0
    }

    let runs = 0;

    while(games.size > 0) {
        let key = games.keys().next().value;
        let {turn, copies, one, two} = games.get(key);
        games.delete(key);

        let isPlayerOne = turn % 2 == 1
        let person = isPlayerOne ? one : two;
        let splits = [];
        QUANTUM_FRACTURES.forEach((count, roll) => {
            let next = (person.position + roll) % 10;
            splits.push({
                copies: count,
                position: next,
                score: person.score + next + 1
            });
        });

        logger.debug(`Game tracking ${copies} copies has generated ${splits.length} fractures...`);

        let merged = 0;

        // enqueue each fracture as a multiple future branch of this
        splits.forEach((fracture) => {
            // compute resulting fracture game
            let game = {
                turn: turn + 1,
                copies: fracture.copies * copies,
                one: {
                    position: isPlayerOne ? fracture.position : one.position,
                    score: isPlayerOne ? fracture.score : one.score
                },
                two: {
                    position: !isPlayerOne ? fracture.position : two.position,
                    score: !isPlayerOne ? fracture.score : two.score
                }
            };

            // check if there was a winner to avoid continued computation on winning fraction
            if(fracture.score >= 21) {
                if(isPlayerOne) {
                    wins.one += game.copies;
                } else {
                    wins.two += game.copies;
                }
                return;
            }

            // otherwise compute a key for the fracture
            let fractureKey = k(game);

            // merge fracture with existing universe if they are equal
            if(games.has(fractureKey)) {
                games.get(fractureKey).copies += game.copies;
                merged++; // fun tracking
            } else {
                games.set(fractureKey, game);
            }
        });

        if(merged > 0) {
            logger.debug(`    ...however, ${merged} fractures converged universal paths!`)
        }
        runs++;
    }

    logger.info(`Universe simulation complete in ${runs}:`);
    logger.info(`     Person 1: ${wins.one}`);
    logger.info(`     Person 2: ${wins.two}`);
    logger.info(`Universal winner: Person ${wins.one > wins.two ? 1 : 2} with ${Math.max(wins.one, wins.two)}`)
}

if(!vars.IS_GOLD) {
    deterministicPlay(one, two)
} else {
    quantumPlay(one, two)
}
