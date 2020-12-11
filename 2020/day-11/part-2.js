const fs = require('fs');

const data = fs.readFileSync('./input.txt');

let seats = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => {
        return line.split('');
    });

function computeAdjacentOccupancy(grid, r, c) {
    let adjacents = [];
    for(let i = r - 1; i <= r + 1; i++) {
        for(let j = c - 1; j <= c + 1; j++) {
            if(i == r && j == c) {
                continue; // skip seat
            }

            adjacents.push(((grid[i] || [])[j] == '#'));
        }
    }
    return adjacents;
}

function computeAdjacentOccupancyFollowToEdge(grid, r, c) {
    let adjacents = [];
    let rows = grid.length;
    let cols = grid[0].length;

    for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
            if(i == 0 && j == 0) {
                // skip current seat
                continue;
            }

            // follow from current seat until the edge looking
            // for occupied seats
            let counted = false;
            let x = r + i;
            let y = c + j;
            while(x >= 0 && y >= 0 && x < rows && y < cols) {
                let target = (grid[x] || [])[y];
                if(target == '#') {
                    adjacents.push(true);
                    counted = true;
                    break;
                } else if(target == 'L') {
                    adjacents.push(false);
                    counted = true;
                    break;
                }
                x += i;
                y += j;
            }
            if(!counted) {
                adjacents.push(false);
            }
        }
    }
    return adjacents;
}

function stepSeats(grid) {
    let grid2 = grid.map((row) => row.slice());

    grid.forEach((row, r) => {
        row.forEach((col, c) => {
            let state = grid[r][c];
            if(state == '.') {
                // skip floor;
                return;
            }
            let adjacents = computeAdjacentOccupancyFollowToEdge(grid, r, c);
            let taken = adjacents.reduce((total, taken) => total + (taken ? 1 : 0), 0)
            if(taken == 0) {
                grid2[r][c] = '#';
            } else if(state == '#' && taken >= 5) {
                grid2[r][c] = 'L';
            }
        });
    });

    return grid2;
}

function gridsEqual(first, second) {
    let equal = true;
    for(let r = 0; r < first.length; r++) {
        for(let c = 0; c < first[r].length; c++) {
            equal = equal && first[r][c] == second[r][c];
        }
    }
    return equal;
}

function printGrid(grid) {
    console.log('Grid:')
    console.log(grid.map((row) => row.join('')).join('\n'));
    console.log();
}

function countOccupied(grid) {
    return grid.reduce((count, row) => count + row.reduce((count, col) => count + (col == '#'), 0), 0)
}

let static = false;
while(!static) {
    let nextSeats = stepSeats(seats);
    static = gridsEqual(seats, nextSeats);
    seats = nextSeats;
}

console.log('Fixed grids!');
printGrid(seats);
console.log(`Occupied: ${countOccupied(seats)}`);
