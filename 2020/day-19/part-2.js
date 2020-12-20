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

    // keep the rest expansions the same
    let expand = ''

    // special case 8 and 11
    if(id == '8') {
        // 8 is a repeating match of 42
        // (42)+
        let rule42 = expandRule(rules, '42', state);
        expand = `(?:${rule42})+`;
    } else if(id == '11') {
        // 11 is a repeat of 42 and 31 an equal number of times on both sides
        // (42)*(31)*
        let rule42 = expandRule(rules, '42', state);
        let rule31 = expandRule(rules, '31', state);
        expand = `(?:${rule42})+(?:${rule31})+`;
    } else {
        // original case handling
        expand = rules.get(id)
            .map((list) => {
                // sub list to expand
                return list.map((entry) => expandRule(rules, entry, state))
                    .join(''); // join without space
            })
            .join('|');
    }

    // lists must be combined and grouped if more than one
    if(expand.length > 1) {
        expand = `(?:${expand})`;
    }

    state.set(id, expand);
    return expand;
}

let state = new Map();
let rule11 = expandRule(rules, '11', state);
let rule42 = expandRule(rules, '42', state);
let rule31 = expandRule(rules, '31', state);

// note that 0 is '8 11';

// so matcher 11 is actually over matching, but will detect all
// possible valid solutions so we can use this as a first limiter
let matcher11 = new RegExp(`^${rule11}$`);
// create non-exact matchers for sub
let matcher42 = new RegExp(`^${rule42}`);
let matcher31 = new RegExp(`^${rule31}`);

// find matching messages
let matching = messages.filter((message) => !!message.match(matcher11))
    .filter((message) => {
        // we know that the message fully matches matcher 11
        // now we need to check that the number of consecutive matches
        // for 31 is equal to or less than 42

        let matches42 = 0;
        let matches31 = 0;
        let match;
        while(match = message.match(matcher42)) {
            matches42++;
            message = message.substring(match[0].length);
        }
        while(match = message.match(matcher31)) {
            matches31++;
            message = message.substring(match[0].length);
        }
        // must have at least 1 more 42
        return matches42 - matches31 > 0;
    });

console.log(`Matching: ${matching.length}`);
