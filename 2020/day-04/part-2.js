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

let eyeColors = new Set([
    'amb',
    'blu',
    'brn',
    'gry',
    'grn',
    'hzl',
    'oth'
]);

let requiredFields = [
    {
        field: 'byr',
        validator: (value) => {
            if(value.length != 4) {
                return false;
            }
            value = parseInt(value, 10);
            return 1920 <= value && value <= 2002;
        }
    },
    {
        field: 'iyr',
        validator: (value) => {
            if(value.length != 4) {
                return false;
            }
            value = parseInt(value, 10);
            return 2010 <= value && value <= 2020;
        }
    },
    {
        field: 'eyr',
        validator: (value) => {
            if(value.length != 4) {
                return false;
            }
            value = parseInt(value, 10);
            return 2020 <= value && value <= 2030;
        }
    },
    {
        field: 'hgt',
        validator: (value) => {
            let height = parseInt(value, 10);
            if(value.endsWith('cm')) {
                return 150 <= height && height <= 193;
            } else if(value.endsWith('in')) {
                return 59 <= height && height <= 76;
            }
            return false;
        }
    },
    {
        field: 'hcl',
        validator: (value) => {
            return !!value.match(/^#[0-9a-f]{6}$/)
        }
    },
    {
        field: 'ecl',
        validator: (value) => {
            return eyeColors.has(value);
        }
    },
    {
        field: 'pid',
        validator: (value) => {
            return !!value.match(/^\d{9}$/);
        }
    }
];

let valid = passports
    .filter((passport) => {
        return requiredFields.every((obj) => {
            let {field, validator} = obj;
            if(!passport.hasOwnProperty(field)) {
                return false;
            }
            return validator(passport[field]);
        });
    });

console.log(`Valid Passports: ${valid.length}`);
