let fs = require('fs');

let data = fs.readFileSync('input.txt');

let passports = data.toString()
    .split('\n\n')
    .map((raw) => raw.trim())
    .filter((raw) => !!raw)
    .map((raw) => raw.replace(/\n/g, ' ')
        .split(' ')
        .reduce((passport, field) => {
            let [key, value] = field.split(':');
            passport[key] = value;
            return passport;
        }, {})
    );

let requiredFields = [
    'byr',
    'iyr',
    'eyr',
    'hgt',
    'hcl',
    'ecl',
    'pid'
];

let valid = passports
    .filter((passport) => {
        return requiredFields.every((field) => passport.hasOwnProperty(field));
    });

console.log(`Valid Passports: ${valid.length}`);
