const { loadAndTransform, logger, vars } = require('../../helpers');

let [initTemplate, rules] = loadAndTransform(vars.INPUT_FILE, '\n\n');

rules = rules.split('\n').map((line) => {
    let match = line.match(/([A-Z]{2}) -> ([A-Z])/);

    return {
        pair: match[1],
        insert: match[2]
    }
}).reduce((rules, rule) => {
    rules.set(rule.pair, rule.insert);
    return rules;
}, new Map());

function initOrIncrement(map, key, value = 1) {
    if(!map.has(key)) {
        map.set(key, 0);
    }
    map.set(key, map.get(key) + value);
}

function iterateTemplate(template) {
    let nextTemplate = new Map();
    template.forEach((value, pair) => {
        if(rules.has(pair)) {
            let insertion = rules.get(pair);
            initOrIncrement(nextTemplate, pair[0] + insertion, value);
            initOrIncrement(nextTemplate, insertion + pair[1], value);
        } else {
            initOrIncrement(nextTemplate, pair, value);
        }
    })

    return nextTemplate;
}

logger.info(`Template: ${initTemplate}`);

let template = new Map();
for(let i = 0; i < initTemplate.length - 1; i++) {
    initOrIncrement(template, initTemplate[i] + initTemplate[i + 1]);
}

logger.debug(template);

let iterations = vars.IS_GOLD ? 40 : 10;

for(let i = 0; i < iterations; i++) {
    template = iterateTemplate(template);
}

let counts = new Map();
template.forEach((value, pair) => {
    // count only first letter in the pair
    initOrIncrement(counts, pair[0], value);
});

// special increment for the final letter of the initial template
initOrIncrement(counts, initTemplate[initTemplate.length - 1]);

let leastCommon, mostCommon;
counts.forEach((value, letter) => {
    leastCommon = leastCommon || letter;
    mostCommon = mostCommon || letter;

    if(counts.get(leastCommon) > value) {
        leastCommon = letter;
    }

    if(counts.get(mostCommon) < value) {
        mostCommon = letter;
    }
});

logger.info(`Least Common: ${leastCommon} - ${counts.get(leastCommon)}`);
logger.info(`Most Common: ${mostCommon} - ${counts.get(mostCommon)}`);
logger.info(`Difference: ${counts.get(mostCommon) - counts.get(leastCommon)}`);
