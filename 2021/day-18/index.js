const { loadAndTransform, logger, vars } = require('../../helpers');

function parseNumber(number, position = 0) {
    let char = number[position];
    switch(char) {
        case '[': {
            let node = {};
            position += 1;

            let left = parseNumber(number, position);
            node.left = left.result;
            node.left.parent = node;
            position += left.consumed + 1;

            let right = parseNumber(number, position);
            node.right = right.result;
            node.right.parent = node;

            return {
                result: node,
                // consume additional 3 ('[',']',',')
                consumed: left.consumed + right.consumed + 3
            };
        }
        case ',':
        case ']': {
            logger.debug(`Invalid parse: '${char}'@${position}`);
            return null;
        }
        default: {
            // just a number parse and return
            return {
                result: {
                    value: parseInt(number[position], 10)
                },
                consumed: 1
            }
        }
    }
}

let numbers = loadAndTransform(vars.INPUT_FILE, '\n', (number) => {
    let {result, consumed} = parseNumber(number);
    if(consumed != number.length) {
        logger.debug(`Consumed: ${consumed} but length ${number.length}`);
    }
    return result;
});

function findAdjacentValue(current, findLeft) {
    do {
        if(findLeft && current.parent.left != current) {
            // a left sibling! now traverse to the right
            current = current.parent.left;
            while(current.right) {
                current = current.right;
            }
            return current;
        } else if(!findLeft && current.parent.right != current) {
            // a right sibling! now traverse to the left
            current = current.parent.right;
            while(current.left) {
                current = current.left;
            }
            return current;
        } else {
            // continue up tree
            current = current.parent;
        }
    } while(current.parent != null);

    // no matching node
    return null;
}

function findNextLeftValue(node) {
    let current = node;
    do {
        if(current.parent.left != current) {
            // a left sibling now traverse all the way to the right
            current = current.parent.left;
            while(current.right) {
                current = current.right;
            }
            return current;
        } else {
            current = current.parent;
        }
    } while(current.parent != null);

    return null;
}

function findNextRightValue(node) {
    let current = node;
    do {
        if(current.parent.right != current) {
            // a right sibling, now traverse all the way to the left
            current = current.parent.right;
            while(current.left) {
                current = current.left;
            }
            return current;
        } else {
            current = current.parent;
        }
    } while(current.parent != null);
    return null;
}

function reduceExplode(node, depth = 1, path = '') {
    if(node.value != null) {
        return false;
    }

    if(depth == 5) {
        logger.debug(`    Explode Pair: [${node.left.value},${node.right.value}] @ ${path}`);
        // since 5 is the max, the children must be values
        // we have to explode this pair, find adjacents
        let leftAdjacent = findAdjacentValue(node, true);
        let rightAdjacent = findAdjacentValue(node, false);
        if(leftAdjacent) {
            leftAdjacent.value += node.left.value;
        }
        if(rightAdjacent) {
            rightAdjacent.value += node.right.value;
        }
        node.left = null;
        node.right = null;
        node.value = 0;
        return true;
    }

    // pair is okay, recurse to children
    let reduced = reduceExplode(node.left, depth + 1, path + 'L');
    if(!reduced) {
        reduced = reduceExplode(node.right, depth + 1, path + 'R');
    }
    return reduced;
}

function reduceSplit(node, path = '') {
    if(node.value != null) {
        let mustSplit = node.value >= 10;

        if(mustSplit) {
            logger.debug(`   Split Node Value: ${node.value} @ ${path}`);
            node.left = {
                parent: node,
                value: Math.floor(node.value / 2)
            };
            node.right = {
                parent: node,
                value: Math.ceil(node.value / 2)
            };
            node.value = null;
        }

        return mustSplit;
    }

    // pair is okay, recurse to children
    let reduced = reduceSplit(node.left, path + 'L');
    if(!reduced) {
        reduced = reduceSplit(node.right, path + 'R');
    }
    return reduced;
}

function reduceSnailfish(number) {
    let reduced;
    logger.debug(`Starting: ${numberToString(number)}`);
    do {
        logger.debug(`  Iteration: ${numberToString(number)}`);
        reduced = reduceExplode(number);
        if(!reduced) {
            reduced = reduceSplit(number);
        }
    } while(reduced);

    logger.debug(`Reduced: ${numberToString(number)}`)

    return number;
}

function numberToString(node) {
    if(node.left) {
        return `[${numberToString(node.left)},${numberToString(node.right)}]`;
    }
    return node.value;
}

function computeMagnitude(node) {
    return node.value != null ? node.value : computeMagnitude(node.left) * 3 + computeMagnitude(node.right) * 2;
}

function cloneSnailfish(node) {
    if(node.value != null) {
        return {
            value: node.value
        }
    }

    let clone = {
        left: cloneSnailfish(node.left),
        right: cloneSnailfish(node.right)
    }

    clone.left.parent = clone;
    clone.right.parent = clone;
    return clone;
}

if(!vars.IS_GOLD) {
    let result = numbers.reduce((previous, number) => {
        if(!previous) {
            return number;
        }

        // add the numbers
        number = {
            left: previous,
            right: number
        };
        number.left.parent = number;
        number.right.parent = number;

        return reduceSnailfish(number);
    });

    logger.info(`Final number: ${numberToString(result)}`);
    logger.info(`Magnitude: ${computeMagnitude(result)}`);
} else {
    let largest = Number.MIN_SAFE_INTEGER;
    let targets = {
        left: null,
        right: null
    }
    numbers.forEach((left) => {
        numbers.forEach((right) => {
            // skip adding to ourselves
            if(left == right) {
                return;
            }

            // we have to clone due to the mutation
            let root = {
                left: cloneSnailfish(left),
                right: cloneSnailfish(right)
            };
            root.left.parent = root;
            root.right.parent = root;

            let reduced = reduceSnailfish(root);
            let magnitude = computeMagnitude(reduced);

            if(magnitude > largest) {
                largest = magnitude;
                targets = {
                    left: left,
                    right: right,
                    reduced: reduced
                };
            }
        });
    });
    logger.info(numberToString(targets.left) + ' + ');
    logger.info(numberToString(targets.right) + ' = ');
    logger.info(numberToString(targets.reduced));
    logger.info(`Magnitude: ${largest}`);
}
