"use strict";
const MongoCollection_1 = require("./MongoCollection");
class MongoDB {
    constructor(config) {
        this._config = config || {};
        this._collections = {};
        this._collectionErrorToThrow = this._config.collectionErrorToThrow || null;
    }
    collection(name, callback) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._collectionErrorToThrow != null) {
                    callback(this._collectionErrorToThrow, null);
                    reject(this._collectionErrorToThrow);
                    return;
                }
                var collection = this._collections[name];
                if (collection == null) {
                    collection = this._collections[name] = new MongoCollection_1.default(this._config);
                }
                callback(null, collection);
                resolve(collection);
            }, 0);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoDB;
//# sourceMappingURL=MongoDB.js.map