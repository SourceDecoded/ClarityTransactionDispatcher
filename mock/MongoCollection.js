"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoCursor_1 = require("./MongoCursor");
class MongoCollection {
    constructor(config) {
        this._config = config;
        this._collectionMethodErrorToThrow = config.collectionMethodErrorToThrow || null;
        this._collectionMethodResult = config.collectionMethodResult || null;
    }
    _mockAsyncResponse(callback) {
        var self = this;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (self._collectionMethodErrorToThrow != null) {
                    callback(self._collectionMethodErrorToThrow, null);
                    reject(self._collectionMethodErrorToThrow);
                    return;
                }
                callback(null, self._collectionMethodResult);
                resolve(self._collectionMethodResult);
            }, 0);
        });
    }
    insertOne(document, callback) {
        return this._mockAsyncResponse(callback);
    }
    deleteOne(filter, callback) {
        return this._mockAsyncResponse(callback);
    }
    update(filter, callback) {
        return this._mockAsyncResponse(callback);
    }
    find(filter, callback) {
        return new MongoCursor_1.default(this._config);
    }
    findOne(filter, callback) {
        return this._mockAsyncResponse(callback);
    }
}
exports.default = MongoCollection;
//# sourceMappingURL=MongoCollection.js.map