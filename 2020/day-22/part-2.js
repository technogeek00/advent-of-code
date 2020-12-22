const { loadAndTransform, logger } = require('../../helpers');

let players = loadAndTransform('input.txt', '\n\n', (player) => {
    let [name, ...cards] = player.split('\n');
    cards = cards.filter((card) => !!card)
        .map((card) => parseInt(card, 10));

    return {
        name: name.substring(0, name.length - 1),
        deck: cards
    }
});

function equalArrays(first, second) {
    if(first.length != second.length) {
        return false;
    }

    return first.every((item, idx) => item == second[idx]);
}

function playRecursiveCombat(first, second, depth = 1) {
    let previousRounds = [];
    logger.debug(`\n=== Game ${depth} ===`);

    while(first.deck.length > 0 && second.deck.length > 0) {
        logger.debug(`\n-- Round ${previousRounds.length + 1} (Game ${depth}) --`);
        logger.debug(`${first.name}'s deck: ${first.deck}`);
        logger.debug(`${second.name}'s deck: ${second.deck}`);
        let matchPrevious = previousRounds.some((round) => {
            return equalArrays(round.first, first.deck) && equalArrays(round.second, second.deck);
        });

        if(matchPrevious) {
            // player 1 automatically wins
            logger.debug(`Already saw this, ${first.name} wins!`);
            return first;
        }

        // otherwise this is a new round capture it
        previousRounds.push({
            first: first.deck.slice(),
            second: second.deck.slice()
        });

        // grab the first cards
        let firstCard = first.deck.shift();
        let secondCard = second.deck.shift();
        logger.debug(`${first.name} plays: ${firstCard}`);
        logger.debug(`${second.name} plays: ${secondCard}`)

        let winner = null;

        if(firstCard <= first.deck.length && secondCard <= second.deck.length) {
            logger.debug(`Playing a sub-game to determine the winner...`)
            // play recursive game to find the winner
            winner = playRecursiveCombat(
                {
                    name: first.name,
                    deck: first.deck.slice(0, firstCard)
                },
                {
                    name: second.name,
                    deck: second.deck.slice(0, secondCard)
                },
                depth + 1
            );
        } else {
            winner = firstCard > secondCard ? first : second;
        }

        logger.debug(`${winner.name} wins ${previousRounds.length} of game ${depth}`);

        // winner is not an equivalent object, so we find and adjust the real object in this game
        if(first.name == winner.name) {
            first.deck.push(firstCard);
            first.deck.push(secondCard);
        } else {
            second.deck.push(secondCard);
            second.deck.push(firstCard);
        }
    }

    return first.deck.length > 0 ? first : second;
}

function computeScore(player) {
    return player.deck.reduce((score, card, idx) => score + (card * (player.deck.length - idx)), 0);
}

let winner = playRecursiveCombat(players[0], players[1]);
let score = computeScore(winner);

logger.info(`${winner.name} wins with score: ${score}`);
