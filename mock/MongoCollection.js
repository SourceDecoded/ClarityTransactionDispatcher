"use strict";
class MongoCollection {
    constructor(config) {
        this._collectionMethodErrorToThrow = config.collectionMethodErrorToThrow || null;
        this._collectionMethodResult = config.collectionMethodResult || null;
    }
    _mockAsyncResponse(callback) {
        setTimeout(() => {
            if (this._collectionMethodErrorToThrow != null) {
                callback(this._collectionMethodErrorToThrow, null);
                return;
            }
            callback(null, this._collectionMethodResult);
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
        this._mockAsyncResponse(callback);
    }
    findOne(filter, callback) {
        this._mockAsyncResponse(callback);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoCollection;
//# sourceMappingURL=MongoCollection.js.map