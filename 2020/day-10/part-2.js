const fs = require('fs');

const data = fs.readFileSync('input.txt');

let adapters = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => parseInt(line, 10));


adapters.sort((a, b) => a - b);

// add start and end nodes
adapters.unshift(0);
adapters.push(adapters[adapters.length - 1] + 3);

let adapterSet = new Set(adapters);

let dp = new Map();
adapters.forEach((adapter) => dp.set(adapter, new Map()));

function countPathVariants(adapter, step) {
    if(adapter == adapters[adapters.length - 1]) {
        return 1;
    }

    if(dp.get(adapter).has(step)) {
        return dp.get(adapter).get(step);
    }

    let result = 0;
    for(let diff = 1; diff <= 3; diff++) {
        if(adapterSet.has(adapter + diff)) {
            result += countPathVariants(adapter + diff, step + 1);
        }
    }
    dp.get(adapter).set(step, result);
    return result;
}

countPathVariants(adapters[0], 0);

console.log(`Number of paths from charger to device: ${dp.get(0).get(0)}`);
