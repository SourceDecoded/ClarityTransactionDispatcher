"use strict";
const MongoCursor_1 = require("./MongoCursor");
class MongoCollection {
    constructor(config) {
        this._config = config;
        this._collectionMethodErrorToThrow = config.collectionMethodErrorToThrow || null;
        this._collectionMethodResult = config.collectionMethodResult || null;
    }
    _mockAsyncResponse(callback) {
        var self = this;
        setTimeout(() => {
            if (self._collectionMethodErrorToThrow != null) {
                callback(self._collectionMethodErrorToThrow, null);
                return;
            }
            callback(null, self._collectionMethodResult);
        }, 0);
    }
    insertOne(document, callback) {
        this._mockAsyncResponse(callback);
    }
    deleteOne(filter, callback) {
        this._mockAsyncResponse(callback);
    }
    update(filter, callback) {
        this._mockAsyncResponse(callback);
    }
    find(filter, callback) {
        return new MongoCursor_1.default(this._config);
    }
    findOne(filter, callback) {
        this._mockAsyncResponse(callback);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoCollection;
//# sourceMappingURL=MongoCollection.js.map