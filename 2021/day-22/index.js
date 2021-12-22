const { loadAndTransform, logger, vars } = require('../../helpers');

// some cube helpers
let cube = {
    struct: (xMin, xMax, yMin, yMax, zMin, zMax, source) => {
        return {
            source: source,
            x: { min: xMin, max: xMax },
            y: { min: yMin, max: yMax },
            z: { min: zMin, max: zMax }
        }
    },
    volume: (cuboid) => {
        let width = cuboid.x.max - cuboid.x.min + 1;
        let height = cuboid.y.max - cuboid.y.min + 1;
        let depth = cuboid.z.max - cuboid.z.min + 1;
        return width * height * depth;
    },
    intersect: (first, second) => {
        if(!cube.overlaps(first, second)) {
            return null;
        }

        return cube.struct(
            Math.max(first.x.min, second.x.min), Math.min(first.x.max, second.x.max),
            Math.max(first.y.min, second.y.min), Math.min(first.y.max, second.y.max),
            Math.max(first.z.min, second.z.min), Math.min(first.z.max, second.z.max)
        )
    },
    overlaps: (first, second) => first.x.max >= second.x.min &&
            first.x.min <= second.x.max &&
            first.y.max >= second.y.min &&
            first.y.min <= second.y.max &&
            first.z.max >= second.z.min &&
            first.z.min <= second.z.max
    ,
    contains: (first, second) => first.x.min <= second.x.min &&
            second.x.max <= first.x.max &&
            first.y.min <= second.y.min &&
            second.y.max <= first.y.max &&
            first.z.min <= second.z.min &&
            second.z.max <= first.z.max
    ,
    containsPoint: (cube, x, y, z) => cube.x.min <= x && x <= cube.x.max &&
            cube.y.min <= y && y <= cube.y.max &&
            cube.z.min <= z && z <= cube.z.max
    ,
    subtract: (from, remove) => {
        let intersection = cube.intersect(from, remove);
        if(!intersection) {
            // no division, from remains together
            return [from];
        }

        // otherwise compute potential splits (6 total for complete coverage)
        let remainders = [];
        if(intersection.x.min > from.x.min) {
            remainders.push(cube.struct(
                from.x.min, intersection.x.min - 1,
                from.y.min, from.y.max,
                from.z.min, from.z.max,
                'x.less'
            ));
        }
        if(intersection.x.max < from.x.max) {
            remainders.push(cube.struct(
                intersection.x.max + 1, from.x.max,
                from.y.min, from.y.max,
                from.z.min, from.z.max,
                'x.more'
            ));
        }
        if(intersection.y.min > from.y.min) {
            remainders.push(cube.struct(
                intersection.x.min, intersection.x.max,
                from.y.min, intersection.y.min - 1,
                from.z.min, from.z.max,
                'y.less'
            ));
        }
        if(intersection.y.max < from.y.max) {
            remainders.push(cube.struct(
                intersection.x.min, intersection.x.max,
                intersection.y.max + 1, from.y.max,
                from.z.min, from.z.max,
                'y.more'
            ));
        }
        if(intersection.z.min > from.z.min) {
            remainders.push(cube.struct(
                intersection.x.min, intersection.x.max,
                intersection.y.min, intersection.y.max,
                from.z.min, intersection.z.min - 1,
                'z.less'
            ));
        }
        if(intersection.z.max < from.z.max) {
            remainders.push(cube.struct(
                intersection.x.min, intersection.x.max,
                intersection.y.min, intersection.y.max,
                intersection.z.max + 1, from.z.max,
                'z.more'
            ));
        }

        return remainders;
    },
    string: (cuboid) => `${cuboid.x.min}..${cuboid.x.max},${cuboid.y.min}..${cuboid.y.max},${cuboid.z.min}..${cuboid.z.max}-${cuboid.source || 'non-split'}`
}

let steps = loadAndTransform(vars.INPUT_FILE, '\n', (step) => {
    let match = step.match(/(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)/);

    return {
        activate: match[1] == 'on',
        cuboid: cube.struct(
            parseInt(match[2], 10), parseInt(match[3], 10),
            parseInt(match[4], 10), parseInt(match[5], 10),
            parseInt(match[6], 10), parseInt(match[7], 10),
            'parse'
        )
    }
});

let activated = [];
steps.forEach((step, i) => {
    logger.debug(`Handling split number ${i} with ${activated.length} regions`);

    if(step.activate) {

        // clear any regions fully contained by cuboid
        activated = activated.filter((region) => !cube.contains(step.cuboid, region));

        // for remaining regions that are not fully contained, remove their existing space from adding region
        let queue = [step.cuboid];
        let processed = [];
        while(queue.length > 0) {
            // pull a cuboid for processing
            let cuboid = queue.shift();
            logger.debug(`    Processing cuboid ${cube.string(cuboid)}`);

            // find a target overlap region
            let target = activated.find((region) => cube.overlaps(region, cuboid));

            if(target) {
                logger.debug(`        ...intersects with ${cube.string(target)} so splitting`);
                let splits = cube.subtract(cuboid, target);
                logger.debug(`        ..resulted in ${splits.length} which are enqueued`);
                splits.forEach((split, idx) => {
                    logger.debug(`            ${idx} - ${cube.string(split)} contained? ${cube.contains(cuboid, split)}`);
                });

                queue = queue.concat(splits);
            } else {
                logger.debug(`        ...does not intersect, queue to add!`);
                processed.push(cuboid);
            }
        }

        activated = activated.concat(processed);
    } else {
        logger.debug(`    Removing cuboid: ${cube.string(step.cuboid)}`);
        activated = activated.reduce((regions, region) => {
            let remainders = cube.subtract(region, step.cuboid);
            if(remainders.length > 1) {
                logger.debug(`        ...intersected ${cube.string(region)} resulting in ${remainders.length} splits:`);
                remainders.forEach((remainder, idx) => {
                    logger.debug(`            ${idx} - ${cube.string(remainder)}`);
                });
            }
            return regions.concat(remainders);
        }, []);
    }
});

if(!vars.IS_GOLD) {
    // constraint cube specified for part 1
    let constraint = cube.struct(
        -50, 50,
        -50, 50,
        -50, 50,
        'constraint'
    );

    // constrain the activated space further
    activated = activated.reduce((regions, region) => {
        let intersection = cube.intersect(region, constraint);
        if(intersection) {
            regions.push(intersection);
        }
        return regions;
    }, []);
}

logger.info(`Computed ${activated.length} independent regions`);

let sum = activated.reduce((sum, region) => sum + cube.volume(region), 0);

logger.info(`Total cubes on: ${sum}`);
