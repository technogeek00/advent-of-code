const { loadAndTransform, logger } = require('../../helpers');

let players = loadAndTransform('test-input.txt', '\n\n', (player) => {
    let [name, ...cards] = player.split('\n');
    cards = cards.filter((card) => !!card)
        .map((card) => parseInt(card, 10));

    return {
        name: name.substring(0, name.length - 1),
        deck: cards
    }
});

function playCombat(first, second) {
    let rounds = 1;

    while(first.deck.length > 0 && second.deck.length > 0) {
        logger.debug(`-- Round ${rounds} --`);
        logger.debug(`${first.name}'s deck: ${first.deck}`);
        logger.debug(`${second.name}'s deck: ${second.deck}`);

        let firstCard = first.deck.shift();
        let secondCard = second.deck.shift();
        logger.debug(`${first.name} plays: ${firstCard}`);
        logger.debug(`${second.name} plays: ${secondCard}`);

        let winner = firstCard > secondCard ? first : second;
        winner.deck.push(Math.max(firstCard, secondCard));
        winner.deck.push(Math.min(firstCard, secondCard));
        logger.debug(`${winner.name} wins the round!\n`)

        rounds++;
    }

    return first.deck.length > 0 ? first : second;
}

function computeScore(player) {
    return player.deck.reduce((score, card, idx) => score + (card * (player.deck.length - idx)), 0);
}

let winner = playCombat(players[0], players[1]);
let score = computeScore(winner);

logger.debug(`== Post-game results ==`);
players.forEach((player) => logger.debug(`${player.name}'s deck: ${player.deck}`))

logger.info(`${winner.name} wins with score: ${score}`);
