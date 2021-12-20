const { loadAndTransform, logger, vars } = require('../../helpers');

let [enhancements, imageRaw] = loadAndTransform(vars.INPUT_FILE, '\n\n');

function k(x, y) {
    return `${x},${y}`;
}

function getLookupValue(source, x, y) {
    let { points, bounds } = source;
    let bits = 0;
    for(let dy = -1; dy <= 1; dy++) {
        for(let dx = -1; dx <= 1; dx++) {
            let tx = x + dx;
            let ty = y + dy;
            let outsideBounds = tx < bounds.x.min || tx > bounds.x.max || ty < bounds.y.min || ty > bounds.y.max;
            if(outsideBounds) {
                bits = bits << 1 | (bounds.infinite ? 1 : 0);
            } else {
                bits = bits << 1 | (points.has(k(tx, ty)) ? 1 : 0);
            }
        }
    }

    return bits;
}

function initImage(source) {
    return {
        points: new Set(),
        bounds: {
            infinite: enhancements.has(0) ? source ? !source.bounds.infinite : false : false,
            x: {
                min: source ? source.bounds.x.min - 1 : Number.MAX_SAFE_INTEGER,
                max: source ? source.bounds.x.max + 1 : Number.MIN_SAFE_INTEGER
            },
            y: {
                min: source ? source.bounds.y.min - 1 : Number.MAX_SAFE_INTEGER,
                max: source ? source.bounds.y.max + 1 : Number.MIN_SAFE_INTEGER
            }
        }
    }
}

function renderImage(image, padding = 10) {
    let render = '';
    let bounds = image.bounds;
    for(let y = bounds.y.min - padding; y <= bounds.y.max + padding; y++) {
        for(let x = bounds.x.min - padding; x <= bounds.x.max + padding; x++) {
            render += image.points.has(k(x, y)) ? '#' : '.';
        }
        render += '\n';
    }
    return render;
}

enhancements = enhancements.split('').reduce((enhancements, char, idx) => {
    if(char == '#') {
        enhancements.add(idx);
    }
    return enhancements;
}, new Set());

let image = imageRaw.split('\n').reduce((image, row, y) => {
    row.split('').forEach((col, x) => {
        if(col == '#') {
            image.points.add(k(x, y));

            image.bounds.x.min = Math.min(image.bounds.x.min, x);
            image.bounds.x.max = Math.max(image.bounds.x.max, x);
            image.bounds.y.min = Math.min(image.bounds.y.min, y);
            image.bounds.y.max = Math.max(image.bounds.y.max, y);
        }
    });
    return image;
}, initImage());


function enhanceImage(image, enhancements) {
    // we have to actually iterate around the maximized grid with 1 row/col of
    // padding since the edge points can be at the edges of the 9 centered grid
    // init image will force the enhanced image to be increased by 1
    let enhanced = initImage(image);

    for(let x = enhanced.bounds.x.min; x <= enhanced.bounds.x.max; x++) {
        for(let y = enhanced.bounds.y.min; y <= enhanced.bounds.y.max; y++) {
            let lookup = getLookupValue(image, x, y);
            if(enhancements.has(lookup)) {
                enhanced.points.add(k(x, y));
            }
        }
    }

    return enhanced;
}

const ITERATIONS = vars.IS_GOLD ? 50 : 2;

logger.info(`Image starts with ${image.points.size} points lit`);

for(let i = 0; i < ITERATIONS; i++) {
    image = enhanceImage(image, enhancements);
    logger.debug(`    Image enhanced to ${image.points.size} points lit`);
}

logger.info(`Final image has ${image.points.size} points lit`);

