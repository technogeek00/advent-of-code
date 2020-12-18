const { loadAndTransform } = require('../../helpers');

let equations = loadAndTransform('input.txt', '\n', (line) => line.replace(/ /g, ''));

function evaluateEquation(str, start = 0) {
    let pos = start;
    let running = 0;
    let action = null;

    // evaluate until the end
    while(pos < str.length && str[pos] != ')') {
        let char = str[pos];
        let val = null;
        switch(char) {
            case '+':
            case '*':
                action = char;
                break;
            case '(':
                // solve sub problem before this
                let sub = evaluateEquation(str, pos + 1);
                pos += sub.consumed;
                val = sub.value;
                break;
            default:
                // its a number!
                val = parseInt(char, 10);
                break;
        }

        pos++; // step forward always, sub calls this moves past end bracket

        if(val != null) {
            if(action == null) {
                running = val;
            } else if(action == '*') {
                running *= val;
                action = null;
            } else {
                running += val;
                action = null;
            }
        }
    }

    return {
        consumed: pos - start + 1,
        value: running
    }
}

let sum = equations.reduce((total, equation) => total + evaluateEquation(equation).value, 0);

console.log(`Equation Sum: ${sum}`)
