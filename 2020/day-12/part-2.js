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

let waypoint = {
    x: 10,
    y: 1
};
let ship = {
    x: 0,
    y: 0
};

actions.forEach((action) => {
    let command = action.action;
    switch(command) {
        case 'N':
            waypoint.y += action.count;
            break;
        case 'S':
            waypoint.y -= action.count;
            break;
        case 'E':
            waypoint.x += action.count;
            break;
        case 'W':
            waypoint.x -= action.count;
            break;
        case 'L':
        case 'R':
            let turn = action.count;
            if(command == 'L') {
                turn = 360 - turn;
            }
            switch(turn) {
                case 90:
                    waypoint = {
                        x: waypoint.y,
                        y: waypoint.x * -1
                    }
                    break;
                case 180:
                    waypoint.x *= -1;
                    waypoint.y *= -1;
                    break;
                case 270:
                    waypoint = {
                        x: waypoint.y * -1,
                        y: waypoint.x
                    }
                    break;
            }
            break;
        case 'F':
            ship.x += waypoint.x * action.count;
            ship.y += waypoint.y * action.count;
            break;
    }
});

console.log(`Manhattan Distance: ${Math.abs(ship.x) + Math.abs(ship.y)}`)
