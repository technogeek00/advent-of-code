const fs = require('fs');

const data = fs.readFileSync('input.txt');

let containment = {};

let parsed = data.toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
    .map((line) => {
        let [key, contains] = line.split(' contain ');
        key = key.replace(' bags', '');
        contains = contains.substring(0, contains.length - 1);
        contains = contains.split(', ');
        if(contains[0] == 'no other bags') {
            containment[key] = [];
        } else {
            containment[key] = contains.map((type) => {
                let [count, adjective, color, ending] = type.split(' ');
                return {
                    count: parseInt(count, 10),
                    adjective: adjective,
                    color: color,
                    key: `${adjective} ${color}`
                }
            })
        }
    });

// walk the map
let canContain = new Set();
let search = 'shiny gold';
Object.keys(containment)
    .forEach((key) => {
        if(key == search) {
            // skip search
            return;
        }
        let toSearch = [key];
        while(toSearch.length > 0) {
            let item = toSearch.shift();
            // found bag or found previously searched path
            if(item == search || canContain.has(item)) {
                canContain.add(key);
                return;
            }
            containment[item].forEach((item) => toSearch.push(item.key));
        }
    })

console.log(`Holders of the shiny: ${canContain.size}`);
