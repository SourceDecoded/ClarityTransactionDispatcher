"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
class GridFs {
    constructor(config) {
        this.readContent = config.readContent;
        this.config = config;
    }
    createReadStream(filter) {
        var readStream = new stream.Readable();
        var content = this.readContent;
        readStream._read = function (size) {
            if (content) {
                this.push(content);
                this.push(null);
            }
        };
        return readStream;
    }
    createWriteStream(filter) {
        var writable = new stream.Writable();
        writable._write = function () {
            this.next();
        };
        return writable;
    }
    remove(filter, callback) {
        var response = this.config.responses.shift();
        var errorToThrow = response.errorToThrow;
        setTimeout(function () {
            if (errorToThrow) {
                callback(errorToThrow, null);
            }
            else {
                callback(null, response.result);
            }
        });
    }
}
exports.default = GridFs;
//# sourceMappingURL=GridFs.js.map