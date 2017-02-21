"use strict";
const MongoDB_1 = require("./MongoDB");
class MongoClient {
    constructor(config) {
        this._config = config || {};
        this._connectErrorToThrow = config.connectErrorToThrow || null;
    }
    connect(databaseUrl, callback) {
        setTimeout(() => {
            if (this._connectErrorToThrow != null) {
                callback(this._connectErrorToThrow, null);
                return;
            }
            callback(null, new MongoDB_1.default(this._config));
        }, 0);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoClient;
//# sourceMappingURL=MongoClient.js.map