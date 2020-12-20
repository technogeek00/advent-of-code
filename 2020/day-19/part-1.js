const { loadAndTransform } = require('../../helpers');

let [rules, messages] = loadAndTransform('input.txt', '\n\n');

rules = rules.split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .reduce((rules, rule) => {
        let [id, value] = rule.split(': ');
        let lists = value.split(' | ')
            .map((list) => list.split(' '));

        rules.set(id, lists);
        return rules;
    }, new Map());

messages = messages.split('\n')
    .map((message) => message.trim())
    .filter((message) => !!message);

function expandRule(rules, id, state = new Map()) {
    if(!rules.has(id)) {
        // not actually an id, just value, strip parens
        return id.replace(/"/g, '');
    }
    if(state.has(id)) {
        return state.get(id);
    }

    let expand = rules.get(id)
        .map((list) => {
            // sub list to expand
            return list.map((entry) => expandRule(rules, entry, state))
                .join(''); // join without space
        })
        .join('|');

    // lists must be combined and grouped if more than one
    if(expand.length > 1) {
        expand = `(${expand})`;
    }

    state.set(id, expand);
    return expand;
}

let expanded = expandRule(rules, '0');

// create matcher, it must be exact
let matcher = new RegExp(`^${expanded}$`);

// find matching messages
let matching = messages.filter((message) => message.match(matcher));

console.log(`Matching: ${matching.length}`);
