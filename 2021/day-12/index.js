const { loadAndTransform, logger, vars } = require('../../helpers');

let paths = loadAndTransform(vars.INPUT_FILE, '\n');

function createNode(node) {
    return {
        name: node,
        big: node == node.toUpperCase(),
        connections: new Set()
    }
}

let nodes = paths.reduce((nodes, path) => {
    let [left, right] = path.split('-');

    let leftNode = nodes[left] = nodes[left] || {
        name: left,
        big: left == left.toUpperCase(),
        connections: new Set()
    };
    let rightNode = nodes[right] = nodes[right] || {
        name: right,
        big: right == right.toUpperCase(),
        connections: new Set()
    };
    nodes[right] = rightNode;

    // don't bother with start back connections
    if(rightNode.name != 'start') {
        leftNode.connections.add(rightNode.name);
    }
    if(leftNode.name != 'start') {
        rightNode.connections.add(leftNode.name);
    }

    return nodes;
}, {});

function walkNodes(name, seen, path, revisited) {
    path.push(name);

    logger.debug(`Traversing: ${name} - ${revisited}`);
    if(name == 'end') {
        logger.debug(`Found path: ${path.join(',')}`);
        return 1;
    }

    let paths = 0;

    nodes[name].connections.forEach((connect) => {
        logger.debug(`    Connection: ${connect}`);
        let big = nodes[connect].big;
        let revisit = seen.has(connect);
        let doubleable = vars.IS_GOLD && !big && revisit && !revisited;
        if(big || !revisit || doubleable) {
            seen.add(connect);
            paths += walkNodes(connect, seen, path, revisited || doubleable);
            path.pop();

            // we can rewalk in different path, but ensure a double visit keeps map correct
            if(!doubleable) {
                seen.delete(connect);
            }
        }
    });

    return paths;
}

let ends = walkNodes('start', new Set(['start']), [], false);

logger.info(`Number of paths found ${ends}`);
