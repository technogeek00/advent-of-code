const { loadAndTransform, logger, vars, sets } = require('../../helpers');

// base 90 degree rotation matricies
let rot = {
    x: [
        [1, 0, 0],
        [0, 0, -1],
        [0, 1, 0]
    ],
    y: [
        [0, 0, 1],
        [0, 1, 0],
        [-1, 0, 0]
    ],
    z: [
        [0, -1, 0],
        [1, 0, 0],
        [0, 0, 1]
    ]
}

// 24 unique point permutations in 3d space using the 90 degree rotations
let rotations = [
    [],
    [rot.x],
    [rot.x, rot.x],
    [rot.x, rot.x, rot.x],

    [rot.y, rot.y],
    [rot.y, rot.y, rot.x],
    [rot.y, rot.y, rot.x, rot.x],
    [rot.y, rot.y, rot.x, rot.x, rot.x],

    [rot.y],
    [rot.y, rot.z],
    [rot.y, rot.z, rot.z],
    [rot.y, rot.z, rot.z, rot.z],

    [rot.y, rot.y, rot.y],
    [rot.y, rot.y, rot.y, rot.z],
    [rot.y, rot.y, rot.y, rot.z, rot.z],
    [rot.y, rot.y, rot.y, rot.z, rot.z, rot.z],

    [rot.z],
    [rot.z, rot.y],
    [rot.z, rot.y, rot.y],
    [rot.z, rot.y, rot.y, rot.y],

    [rot.z, rot.z, rot.z],
    [rot.z, rot.z, rot.z, rot.y],
    [rot.z, rot.z, rot.z, rot.y, rot.y],
    [rot.z, rot.z, rot.z, rot.y, rot.y, rot.y]
];

function multiplyMatrixByPoint(square, single) {
    return square.reduce((sums, row) => {
        let sum = row.reduce((sum, entry, i) => {
            return sum + entry * single[i];
        }, 0);
        sums.push(sum);
        return sums;
    }, []);
}

function applyRotations(pointObj, rotations) {
    let point = [pointObj.x, pointObj.y, pointObj.z];

    let rotated = rotations.reduce((point, step) => {
        return multiplyMatrixByPoint(step, point);
    }, point);

    return {
        x: rotated[0],
        y: rotated[1],
        z: rotated[2]
    }
}

function pointDistance(first, second) {
    // Note this is explicitly not square rooting to avoid floating point
    // precision errors that could occur in JS. This has no effect on equivalency
    return Math.pow(first.x - second.x, 2) +
        Math.pow(first.y - second.y, 2) +
        Math.pow(first.z - second.z, 2);
}

let scanners = loadAndTransform(vars.INPUT_FILE, '\n\n', (scanner) => {
    let [title, ...beacons] = scanner.split('\n');
    beacons = beacons.map((beacon, i) => {
        let match = beacon.match(/(-?\d+),(-?\d+),(-?\d+)/);
        return {
            id: i,
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
            z: parseInt(match[3], 10),
            distances: new Map()
        };
    });

    // compute distances between all beacons, store as reverse map
    beacons.forEach((beacon) => {
        beacons.forEach((other) => {
            if(beacon == other) {
                return;
            }

            let distance =
                Math.pow(beacon.x - other.x, 2) +
                Math.pow(beacon.y - other.y, 2) +
                Math.pow(beacon.z - other.z, 2);
            beacon.distances.set(distance, other.id);
        });
    });

    let match = title.match(/-+ scanner (\d+) -+/);

    return {
        name: `Scanner ${match[1]}`,
        beacons: beacons
    }
});

// assume scanner 0 is in the right position
// try to align scanner 1 as a test

function alignScanner(aligned, unaligned) {
    let dest;
    let source = aligned.beacons.find((source) => {
        destination = unaligned.beacons.find((destination) => {
            let matching = 0;
            source.distances.forEach((value, key) => {
                if(destination.distances.has(key)) {
                    matching++;
                }
            });
            return matching == 11;
        });
        return !!destination;
    });

    if(!source) {
        return false;
    }

    logger.debug(`    Beacon ${source.id} appears to match ${destination.id}`);
    logger.debug(`         ${source.id} - ${source.x}, ${source.y}, ${source.z}`);
    logger.debug(`         ${destination.id} - ${destination.x}, ${destination.y}, ${destination.z}`);

    // for each matched point, grab the destination partner point, perform rotation and compute distance
    // from the source partner point, when the rotation is correct all the distances computed will be
    // equal as the points will be simply offset
    let rotation = rotations.find((sequence) => {
        let distances = [];

        source.distances.forEach((alignedIdx, key) => {
            if(!destination.distances.has(key)) {
                // this was not a matching point
                return;
            }

            let sourcePartner = aligned.beacons[alignedIdx];
            let destPartner = unaligned.beacons[destination.distances.get(key)];
            let rotated = applyRotations(destPartner, sequence);
            let distance = pointDistance(sourcePartner, rotated);
            distances.push(distance);

        });

        return distances.every((distance) => distances[0] == distance);
    });

    if(!rotation) {
        // highly unlikely case, but suppose for some reason we actually got 12 points with matching
        // distance spacing but then couldn't find a rotation, it would be magical input but possible
        return false;
    }

    // with the rotation known, rotate all points in the second scanner
    unaligned.rotation = rotation;
    unaligned.beacons.forEach((beacon) => {
        let rotated = applyRotations(beacon, rotation);
        beacon.x = rotated.x;
        beacon.y = rotated.y;
        beacon.z = rotated.z;
    });

    // compute the point offsets using the original source and destination points identified
    let offset = {
        x: destination.x - source.x,
        y: destination.y - source.y,
        z: destination.z - source.z
    }

    // finally offset the unaligned beacons relative to the aligned scanner
    unaligned.beacons.forEach((beacon) => {
        beacon.x -= offset.x;
        beacon.y -= offset.y;
        beacon.z -= offset.z;
    });

    // and store the position of the newly aligned scanner relative to the currently aligned scanner
    // note we are aligning the scanner to the grid offset, not the scanner, which means it will align
    // to the original scanner always
    unaligned.position = {
        x: -1 * offset.x,
        y: -1 * offset.y,
        z: -1 * offset.z
    }

    // signal alignment
    return true;
}

// just assume scanner 0 is correctly oriented
scanners[0].position = {
    x: 0,
    y: 0,
    z: 0
}

// create set of aligned and set of unaligned scanners
// an unaligned scanner can align to any aligned scanner since we
// will force that all aligned scanners have beacons absolutely aligned
let alignedScanners = [scanners[0]];
let unalignedScanners = scanners.slice(1);
while(unalignedScanners.length > 0) {
    let unaligned = unalignedScanners.shift();

    logger.debug(`Aligning ${unaligned.name}`);

    let didAlign = alignedScanners.some((aligned) => {
        return alignScanner(aligned, unaligned);
    });

    if(didAlign) {
        logger.debug(`    Aligned to ${JSON.stringify(unaligned.position)}`);
        alignedScanners.push(unaligned);
    } else {
        logger.debug(`    Could not be aligned currently`);
        unalignedScanners.push(unaligned);
    }
}

logger.debug(`Aligned all scanners`);

// now just build set of points
let beacons = new Set();

scanners.forEach((scanner) => {
    scanner.beacons.forEach((beacon) => {
        beacons.add(`${beacon.x},${beacon.y},${beacon.z}`);
    });
});


logger.info(`There are ${beacons.size} unique beacons`);

if(!vars.IS_GOLD) {
    return;
}

let result = {
    first: null,
    second: null,
    manhattan: Number.MIN_SAFE_INTEGER
};

scanners.forEach((first) => {
    scanners.forEach((second) => {
        if(first == second) {
            return;
        }

        let manhattan =
            Math.abs(first.position.x - second.position.x) +
            Math.abs(first.position.y - second.position.y) +
            Math.abs(first.position.z - second.position.z);
        if(manhattan > result.manhattan) {
            result.manhattan = manhattan;
            result.first = first;
            result.second = second;
        }
    });
});

logger.info(`The largest Manhattan distance: ${result.manhattan}`);
logger.info(` between ${result.first.name} and ${result.second.name}`);
