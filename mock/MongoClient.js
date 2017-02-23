"use strict";
const MongoDB_1 = require("./MongoDB");
class MongoClient {
    constructor(config) {
        this._config = config || {};
        this._responses = this._config.responses;
    }
    connect(databaseUrl, callback) {
        var response = this._responses.shift();
        if (response == null) {
            throw new Error("Expected a response.");
        }
        var connectErrorToThrow = response.connectErrorToThrow;
        setTimeout(() => {
            if (connectErrorToThrow != null) {
                callback(connectErrorToThrow, null);
                return;
            }
            callback(null, new MongoDB_1.default(response));
        }, 0);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoClient;
//# sourceMappingURL=MongoClient.js.map