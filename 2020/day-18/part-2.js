const { loadAndTransform } = require('../../helpers');

let equations = loadAndTransform('input.txt', '\n', (line) => line.replace(/ /g, ''));

function evaluteEquation(equation, start = 0) {
    let pos = start;
    let intermediate = [];
    let action = null;
    while(pos < equation.length && equation[pos] != ')') {
        let char = equation[pos];
        let val = null;
        switch(char) {
            case '+':
                action = char;
                break;
            case '*':
                // ignore, loop eliminates all but * so we can drop the information
                break;
            case '(':
                let sub = evaluteEquation(equation, pos + 1);
                pos += sub.consumed;
                val = sub.value;
                break;
            default:
                val = parseInt(char, 10);
                break;
        }

        pos++; // step forward always, sub calls this moves past end bracket

        if(val != null) {
            if(action == null) {
                // push number into intermediate set
                intermediate.push(val);
            } else {
                // perform add operations directly
                let last = intermediate.pop();
                intermediate.push(last + val);
                action = null; // reset action
            }
        }
    }

    // loop handles all addition and recursive calls handle all parens
    let running = intermediate.reduce((mult, val) => mult * val, 1);
    return {
        consumed: pos - start + 1,
        value: running
    }
}

let sum = equations.reduce((total, equation) => total + evaluteEquation(equation).value, 0);

console.log(`Equation Sum: ${sum}`);
