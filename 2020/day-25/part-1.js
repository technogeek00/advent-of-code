// We were actually traveling this day and this has been in a sticky note on my phone
// ever since then. So here is the raw code, no clean, directly from the phone I typed it on

let card = 14788856;

let door = 19316454;

let div = 20201227;

function findLoop(subject, target){
    let i = 0;
    let val = 1;
    while(val != target) {
        val = (val * subject) % div;
        i++;
    }

    if(val != target) return -1;

    return i;
}

let cardLoop = findLoop(7, card);

let doorLoop = findLoop(7, door);

console.log(`Card: ${cardLoop} - Door: ${doorLoop}`);

function encryptionKey(loop, subject) {
    let val = 1;
    for(let i = 0; i < loop; i++) {
        val = (val * subject) % div;
    }

    return val;
}

let keyCard = encryptionKey(cardLoop, door);
let keyDoor = encryptionKey(doorLoop, card);

console.log(`${keyCard} - ${keyDoor}`)
