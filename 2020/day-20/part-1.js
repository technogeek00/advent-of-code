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

// sanity check no borders repeat more than once (for adjacent)
let borders = tiles.reduce((borderCount, tile) => {
    Object.keys(tile.borders)
        .forEach((name) => {
            let value = tile.borders[name].value;
            if(!borderCount.has(value)) {
                borderCount.set(value, 0);
            }
            borderCount.set(value, borderCount.get(value) + 1);
        });
    return borderCount;
}, new Map());

let BORDERS = ['top', 'left', 'right', 'bottom'];

function matchingBorder(search, tile) {
    return BORDERS.find((side) => {
        let forward = tile.borders[side].value;
        let reversed = forward.split('').reverse().join('');
        return forward == search || reversed == search;
    });
}

function findTileWithBorder(tiles, border, exclude) {
    return tiles.find((tile) => {
        let match = matchingBorder(border, tile);
        return tile.id != exclude && !!match;
    });
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

let corners = tiles.reduce((corners, tile) => {
    let hasCornerMatch =
        (tile.borders.top.adjacent && tile.borders.left.adjacent) ||
        (tile.borders.top.adjacent && tile.borders.right.adjacent) ||
        (tile.borders.bottom.adjacent && tile.borders.left.adjacent) ||
        (tile.borders.bottom.adjacent && tile.borders.right.adjacent);
    let adjacents = BORDERS.reduce((count, side) => {
        return count + (!!tile.borders[side].adjacent ? 1 : 0);
    }, 0);
    if(hasCornerMatch && adjacents == 2) {
        corners.push(tile);
    }
    return corners;
}, []);

let multipled = corners.reduce((multiply, corner) => corner.id * multiply, 1);
console.log(`Multiplied Value ${multipled}`);
