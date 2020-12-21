const { loadAndTransform } = require('../../helpers');

let tiles = loadAndTransform('input.txt', '\n\n', (tile) => {
    let [id, ...lines] = tile.split('\n');
    id = parseInt(id.match(/\d+/)[0], 10);

    let grid = lines.map((line) => line.split(''));

    // generate borders
    let borders = {
        top: {
            value: grid[0].join(''),
            adjacent: null
        },
        left: {
            value: grid.map((row) => row[0]).join(''),
            adjacent: null
        },
        right: {
            value: grid.map((row) => row[row.length - 1]).join(''),
            adjacent: null
        },
        bottom: {
            value: grid[grid.length - 1].join(''),
            adjacent: null
        }
    };

    return {
        id: id,
        grid: grid,
        borders: borders
    }
});

let BORDERS = ['top', 'left', 'right', 'bottom'];

function matchingBorder(search, tile) {
    return BORDERS.find((side) => {
        let forward = tile.borders[side].value;
        let reversed = reverseBorder(forward);
        return forward == search || reversed == search;
    });
}

function findTileWithBorder(tiles, border, exclude) {
    return tiles.find((tile) => {
        let match = matchingBorder(border, tile);
        return tile.id != exclude && !!match;
    });
}

function reverseBorder(border) {
    return border.split('').reverse().join('');
}

// assign tile adjacents
tiles.forEach((tile) => {
    // find a matching tile for each border
    BORDERS.forEach((side) => {
        let border = tile.borders[side];
        let adjacent = findTileWithBorder(tiles, border.value, tile.id);
        if(adjacent) {
            border.adjacent = adjacent.id;
        }
    });
});

let topLeftCorner = tiles.find((tile) => {
    return tile.borders.bottom.adjacent != null &&
        tile.borders.right.adjacent != null &&
        tile.borders.top.adjacent == null &&
        tile.borders.left.adjacent == null;
});

let tileMap = tiles.reduce((map, tile) => {
    map.set(tile.id, tile);
    return map;
}, new Map());

function rotateGridLeft(grid) {
    let rows = grid.length;
    let cols = grid[0].length;
    let rotated = [];
    // assumes square
    for(let i = 0; i < rows; i++) {
        let row = [];
        for(let j = 0; j < cols; j++) {
            row.push(grid[j][rows - i - 1]);
        }
        rotated.push(row);
    }
    return rotated;
}

function rotateGridRight(grid) {
    let rows = grid.length;
    let cols = grid[0].length;
    let rotated = [];
    // assumes square
    for(let i = 0; i < rows; i++) {
        let row = [];
        for(let j = 0; j < cols; j++) {
            row.push(grid[cols - j - 1][i]);
        }
        rotated.push(row);
    }
    return rotated;
}

function flipGridVertical(grid) {
    // just reverse the array to vertical flip
    grid.reverse();
    return grid;
}

function flipGridHorizontal(grid) {
    // reverse the rows to horizontal flip
    grid.forEach((row) => row.reverse());
    return grid;
}

function flipTileVertical(tile) {
    tile.grid = flipGridVertical(tile.grid);

    // swap top and bottom borders
    let temp = tile.borders.top;
    tile.borders.top = tile.borders.bottom;
    tile.borders.bottom = temp;

    // reverse left and right borders
    tile.borders.left.value = reverseBorder(tile.borders.left.value);
    tile.borders.right.value = reverseBorder(tile.borders.right.value);
}

function flipTileHorizontal(tile) {
    tile.grid = flipGridHorizontal(tile.grid);

    // swap the left and right borders
    let temp = tile.borders.left;
    tile.borders.left = tile.borders.right;
    tile.borders.right = temp;

    // reverse top and bottom borders
    tile.borders.top.value = reverseBorder(tile.borders.top.value);
    tile.borders.bottom.value = reverseBorder(tile.borders.bottom.value);
}

function rotateTileLeft(tile) {
    tile.grid = rotateGridLeft(tile.grid);

    // adjust the borders
    let top = tile.borders.top;
    let left = tile.borders.left;
    let right = tile.borders.right;
    let bottom = tile.borders.bottom;

    // top goes left, needs reversal
    tile.borders.left = top;
    tile.borders.left.value = reverseBorder(tile.borders.left.value)
    // left goes to bottom, does not need reversal
    tile.borders.bottom = left;
    // bottom goes to right, does need reversal
    tile.borders.right = bottom;
    tile.borders.right.value = reverseBorder(tile.borders.right.value);
    // right goes to top, does not need reversal
    tile.borders.top = right;
}

function rotateTileRight(tile) {
    tile.grid = rotateGridRight(tile.grid);

    // adjust the borders
    let top = tile.borders.top;
    let left = tile.borders.left;
    let right = tile.borders.right;
    let bottom = tile.borders.bottom;

    // top goes right, does not need reversal
    tile.borders.right = top;
    // right goes bottom, needs reversal
    tile.borders.bottom = right;
    tile.borders.bottom.value = reverseBorder(tile.borders.bottom.value);
    // bottom goes to left, does not need reversal
    tile.borders.left = bottom;
    // left goes to top, needs reversal
    tile.borders.top = left;
    tile.borders.top.value = reverseBorder(tile.borders.top.value);
}

function ensureRowAligned(current, tileMap) {
    // ensure tiles from the right are properly aligned
    while(current != null) {
        let tile = tileMap.get(current);

        // ensure right tile aligned
        let border = tile.borders.right;
        if(border.adjacent) {
            let right = tileMap.get(border.adjacent);
            // now we need to detect orientation and correct
            let match = matchingBorder(border.value, right);
            // also check if match reversed
            let reversed = reverseBorder(right.borders[match].value) == border.value;

            switch(match) {
                case 'left':
                    if(reversed) {
                        // if left but reversed we flip vertical
                        flipTileVertical(right);
                    } // otherwise already good
                    break;
                case 'right':
                    // if match was also on the right flip horizontal
                    flipTileHorizontal(right);
                    if(reversed) {
                        // if reversed also flip vertical
                        flipTileVertical(right);
                    }
                    break;
                case 'top':
                    // rotate to the left
                    rotateTileLeft(right);
                    if(!reversed) {
                        // right goes top to bottom
                        // top goes left to right
                        // meaning a reverse is corrected by left rotation
                        // but a non-reverse now needs to be reversed
                        flipTileVertical(right);
                    }
                    break;
                case 'bottom':
                    // rotate to the right
                    rotateTileRight(right);
                    if(reversed) {
                        // right goes top to bottom
                        // bottom goes left to right
                        // meaning a non-reversed is still correct
                        // but a reverse now needs to be reversed
                        flipTileVertical(right);
                    }
                    break;
            }
        }

        // ensure bottom tile aligned
        border = tile.borders.bottom;
        if(border.adjacent) {
            let bottom = tileMap.get(border.adjacent);
            let match = matchingBorder(border.value, bottom);
            let reversed = reverseBorder(bottom.borders[match].value) == border.value;

            switch(match) {
                case 'left':
                    // match on the left needs to rotate to top
                    rotateTileRight(bottom);
                    if(!reversed) {
                        // left match reverses on rotation, so non reversed needs flip
                        flipTileHorizontal(bottom);
                    }
                    break;
                case 'right':
                    // match on the right needs to rotate to top
                    rotateTileLeft(bottom);
                    if(reversed) {
                        // right match is already in order, so reversed needs flip
                        flipTileHorizontal(bottom);
                    }
                    break;
                case 'top':
                    if(reversed) {
                        // if top but reversed we flip horizontal
                        flipTileHorizontal(bottom);
                    } // otherwise already good
                    break;
                case 'bottom':
                    // match on bottom flip vertical
                    flipTileVertical(bottom);
                    if(reversed) {
                        flipTileHorizontal(bottom);
                    }
                    break;
            }
        }

        // step right
        current = tile.borders.right.adjacent;
    }
}

// walk top to bottom, sorting out the rows as we go

let ids = [];

let current = topLeftCorner.id;
while(current != null) {
    ensureRowAligned(current, tileMap);

    let temp = current;
    while(temp != null) {
        ids.push(temp);
        let tile = tileMap.get(temp);
        temp = tile.borders.right.adjacent;
    }
    // now step down
    let tile = tileMap.get(current);
    current = tile.borders.bottom.adjacent;
}

// at this point we should be able to generate the real map

function pruneGrid(grid) {
    // remove first and last row and column
    return grid.slice(1, grid.length - 1)
        .map((row) => row.slice(1, row.length - 1));
}

let image = [];
let rowCurrent = topLeftCorner.id;
while(rowCurrent != null) {
    let row = [];
    let colCurrent = rowCurrent;
    while(colCurrent != null) {
        let tile = tileMap.get(colCurrent);
        // prune the grid and add to row set
        row.push(pruneGrid(tile.grid));
        colCurrent = tile.borders.right.adjacent;
    }

    // with the grids collected, lets simplify before adding to image
    let rows = row.reduce((combined, grid) => {
        if(!combined) {
            return grid;
        }

        for(let i = 0; i < combined.length; i++) {
            combined[i] = combined[i].concat(grid[i]);
        }
        return combined;
    }, null);

    image = image.concat(rows);

    // step to next row
    let tile = tileMap.get(rowCurrent);
    rowCurrent = tile.borders.bottom.adjacent;
}

function serializeGrid(grid) {
    return grid.map((row) => row.join('')).join('\n');
}


let SEAMONSTER = [
    `                  # `,
    `#    ##    ##    ###`,
    ` #  #  #  #  #  #   `
].map((row) => row.split(''));

function subGridMatch(grid, subgrid, row, col) {
    if(row + subgrid.length >= grid.length) {
        return false;
    }
    if(col + subgrid[0].length >= grid[0].length) {
        return false;
    }

    for(let i = 0; i < subgrid.length; i++) {
        for(let j = 0; j < subgrid[i].length; j++) {
            if(subgrid[i][j] == '#' && grid[i + row][j + col] != '#') {
                return false;
            }
        }
    }

    return true;
}

function countMatches(grid, subgrid) {
    let matches = 0;
    for(let row = 0; row < grid.length - subgrid.length; row++) {
        for(let col = 0; col < grid[row].length - subgrid[0].length; col++) {
            if(subGridMatch(grid, subgrid, row, col)) {
                matches++;
            }
        }
    }
    return matches;
}

function countHashes(grid) {
    return grid.reduce((total, row) => total + row.reduce((total, value) => total + (value == '#' ? 1 : 0), 0), 0)
}

// we need to find the right orientation and we know there will be matches
let rotation = 0;
let matches = 0;
while(matches == 0) {
    matches = countMatches(image, SEAMONSTER);
    if(matches == 0) {
        image = rotateGridRight(image);
        rotation++;

        if(rotation == 4) {
            image = flipGridVertical(image);
        }
    }
}

let hashes = countHashes(image);
let monsterHashes = countHashes(SEAMONSTER);
console.log(`The Sea Contains: ${matches} Monsters`);
console.log(`Looks to be a roughness of ${hashes - monsterHashes * matches}`);
