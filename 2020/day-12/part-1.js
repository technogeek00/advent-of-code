const fs = require('fs');

const data = fs.readFileSync('input.txt');

let actions = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => {
        return {
            action: line.substring(0, 1),
            count: parseInt(line.substring(1), 10)
        }
    });

let direction = 'E';
let point = {
    x: 0,
    y: 0
}

let directions = ['N', 'E', 'S', 'W'];

function computeTurn(current, degrees) {
    let next = Math.floor(degrees / 90);
    let cur = directions.indexOf(current);
    cur += next;
    return directions[cur % directions.length];
}

actions.forEach((action) => {
    let command = action.action;
    if(command == 'F') {
        command = direction;
    }
    switch(command) {
        case 'N':
            point.y += action.count;
            break;
        case 'S':
            point.y -= action.count;
            break;
        case 'E':
            point.x += action.count;
            break;
        case 'W':
            point.x -= action.count;
            break;
        case 'L':
            direction = computeTurn(direction, 360 - action.count);
            break;
        case 'R':
            direction = computeTurn(direction, action.count);
            break;
    }
});

console.log(`Manhattan Distance: ${Math.abs(point.x) + Math.abs(point.y)}`)
