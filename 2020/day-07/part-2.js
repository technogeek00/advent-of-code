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

function depthBags(search) {
    let toSearch = [{
        key: search,
        count: 1
    }];
    let needed = 0;
    while(toSearch.length > 0) {
        let item = toSearch.shift();
        containment[item.key].forEach((sub) => {
            needed += item.count * sub.count;
            toSearch.push({
                key: sub.key,
                count: sub.count * item.count
            });
        });
    }
    return needed;
}

let result = depthBags('shiny gold');
console.log(`Nested bags of doom: ${result}`);
