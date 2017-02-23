import { IGridFs } from "./../library/interfaces";
import * as stream from "stream";

export default class GridFs implements IGridFs {
    private readContent: string;
    private config;

    constructor(config) {
        this.readContent = config.readContent;
        this.config = config;
    }

    createReadStream(filter: {
        _id?: string;
        filename: string;
    }) {
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

    createWriteStream(filter: {
        _id?: string;
        filename: string;
    }) {
        var writable = new stream.Writable();
        writable._write = function () {
            this.next();
        };

        return writable;
    }

    remove(filter: {
        _id: string;
    }, callback: (err, result) => void) {
        var response = this.config.responses.shift();
        var errorToThrow = response.errorToThrow;

        setTimeout(function () {
            if (errorToThrow) {
                callback(errorToThrow, null);
            } else {
                callback(null, response.result);
            }
        });
    }

}