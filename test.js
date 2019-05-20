const { Parser } = require('./');
const parser = new Parser();

const { createReadStream } = require('fs');
const path = require('path');

const pathToFile = path.resolve('./users4.csv');
const readStream = createReadStream(pathToFile);

const wrap = {
    targets: ['first_name', 'last_name'],
    to: 'person',
}

const fieldNames = {
    'first_name': 'firstName',
    'last_name': 'lastName',
    'user': 'name',
    'phone': 'phone',
    'cc': 'costCenterNum',
    'amount': 'amount',
    'date': 'date',
}

function serializer(key, item, obj) {
    const index = wrap.targets.indexOf(key);
    
    if (index !== -1) {
        if (!obj[wrap.to]) {
            obj[wrap.to] = {};
        }
        obj[wrap.to][wrap.targets[index]] = item;
    } else {
        obj[key] = item;
    }
}


parser.parse(readStream, serializer).then((data) => {
    console.log('final data: ', data);
})