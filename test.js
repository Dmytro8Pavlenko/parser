const {
    Parser,
} = require('./');
const parser = new Parser();

const {
    createReadStream,
    writeFile,
} = require('fs');
const path = require('path');


const fieldNames = {
    'first_name': {
        name: 'firstName',
        wrapper: 'person',
    },
    'last_name': {
        name: 'lastName',
        wrapper: 'person',
    },
    'user': {
        name: 'name',
    },
    'phone': {
        name: 'phone',
        formatter: string => {
            return parseInt(string.replace(/\D/g, ''), 10);
        },
    },
    'cc': {
        name: 'costCenterNum',
        formatter: string => {
            return string.replace(/\D/g, '');
        },
    },
    'amount': {
        name: 'amount',
        formatter: string => {
            return parseFloat(string);
        },
    },
    'date': {
        name: 'date',
        formatter: string => {
            //return (new Date(string)).toISOString().slice(0, 10);
            const dateParts = string.split('/');
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        },
    },
};

function serializer(key, item, obj) {
    if (fieldNames[key] && fieldNames[key].name) {
        const newItem = fieldNames[key].formatter ? fieldNames[key].formatter(item) : item;
        if (fieldNames[key].wrapper) {
            if (!obj[fieldNames[key].wrapper]) {
                obj[fieldNames[key].wrapper] = {};
            };
            obj[fieldNames[key].wrapper][fieldNames[key].name] = newItem;
        } else {
            obj[fieldNames[key].name] = newItem;
        }
    };
};

const csvNamesArray = ['users1', 'users2', 'users3', 'users4'];

for (let fileName of csvNamesArray) {
    const pathToFile = path.resolve(`./input/${fileName}.csv`);
    const readStream = createReadStream(pathToFile);

    parser.parse(readStream, serializer).then((data) => {
        writeFile(`./output/${fileName}.json`, JSON.stringify(data), (err) => {
            if (err) console.log(err);
            console.log("Successfully Written to File.");
        });
        console.log('final data: ', data);
    });
}