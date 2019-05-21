const { createInterface } = require('readline');

class Parser {
    constructor() {
        this.requests = {};
        this.lineSeparator = '||';
    }
    parse(readStream, serializer = (key, item, obj) => obj[key] = item) {
        const symbol = Symbol();
        this.requests[symbol] = {
            data: [],
            lineReader: createInterface({ input: readStream }),
            serializer,
            keys: undefined,
        };
        this.requests[symbol].lineReader.once('line', line => {
            this.handleFirstLine(line, symbol);
        })
        return new Promise((resolve, reject) => {
            this.requests[symbol].lineReader.on('close', () => {
                resolve(this.requests[symbol].data);
                delete this.requests[symbol];
            });
            readStream.on('error', reject);
        })
    }
    handleFirstLine(firstLine, symbol) {
        this.requests[symbol].keys = this.parseLine(firstLine);
        this.requests[symbol].lineReader.on('line', line => {
            this.handleLine(line, symbol);
        });
    }
    handleLine(line, symbol) {
        let newItem = {};
        this.parseLine(line).forEach((item, index) => {
            this.requests[symbol].serializer(this.requests[symbol].keys[index], item, newItem);
        });
        
        this.requests[symbol].data.push(newItem);
    }
    parseLine(line) {
        return line.split(this.lineSeparator).map(this.trim);
    }
    trim(item) {
        return item[0] === '"' ? item.substring(1, item.length - 1): item;
    }
}

module.exports = Parser;