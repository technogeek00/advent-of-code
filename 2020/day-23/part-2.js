const { loadAndTransform, logger } = require('../../helpers');

let [cups] = loadAndTransform('input.txt', '\n', (ordering) => ordering.split(''))

cups = cups.map((cup) => parseInt(cup, 10));

let max = cups.reduce((max, cur) => Math.max(max, cur), -1);
let min = cups.reduce((min, cur) => Math.min(min, cur), max);

function serializeList(start) {
    let print = start;
    let buffer = "";
    do {
        if(print == current) {
            buffer += `(${print.value}) `;
        } else {
            buffer += `${print.value} `;
        }
        print = print.next;
    } while(print != mapList.list);
    return buffer;
}

for(let pad = max + 1; pad <= 1000000; pad++) {
    cups.push(pad);
}

max = 1000000; // lul constants need updating

function generateMapList(cups) {
    let mapping = new Map();
    let head;
    let prev;
    for(let i = 0; i < cups.length; i++) {
        let item = {
            value: cups[i],
            next: null,
            prev: prev
        }

        mapping.set(cups[i], item);

        if(prev) {
            prev.next = item;
        }

        if(!head) {
            head = prev;
        }
        prev = item;
    }

    // tie head to tail
    head.prev = prev;
    prev.next = head;

    return {
        list: head,
        map: mapping
    }
}

let mapList = generateMapList(cups);

let turns = 10000000;

let current = mapList.list;

for(var i = 0; i < turns; i++) {
    //logger.debug(`Cups: ${serializeList(mapList.list)}`);
    let pickStart = current.next;
    let pickEnd = pickStart.next.next;
    let pickSet = [pickStart.value, pickStart.next.value, pickEnd.value];
    logger.debug(`Current: ${current.value}`);
    logger.debug(`Pick set: ${pickSet}`);

    // remove pick set from list
    current.next = pickEnd.next;
    pickEnd.next.prev = current;
    pickStart.prev = null;
    pickEnd.next = null;

    let destination = current.value - 1;
    let placement;
    while(!mapList.map.has(destination) || pickSet.indexOf(destination) != -1) {
        destination--;
        if(destination < min) {
            destination = max;
        }
    }
    logger.debug(`Destination: ${destination}`);

    let pickDest = mapList.map.get(destination);

    // splice the set into pick destination
    pickEnd.next = pickDest.next;
    pickEnd.next.prev = pickEnd;
    pickDest.next = pickStart;
    pickStart.prev = pickDest;

    current = current.next;
}

logger.debug(`-- final --`);
//logger.debug(`cups: ${serializeList(mapList.list)}`)

let start = mapList.map.get(1);
logger.info(`Next ${start.next.value} * ${start.next.next.value} => ${start.next.value * start.next.next.value}`);
