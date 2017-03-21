"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoDB_1 = require("./MongoDB");
class MongoClient {
    constructor(config) {
        this._config = config || {};
        this._responses = this._config.responses;
    }
    connect(databaseUrl, callback) {
        return new Promise((resolve, reject) => {
            var response = this._responses.shift();
            if (response == null) {
                throw new Error("Expected a response.");
            }
            var connectErrorToThrow = response.connectErrorToThrow;
            setTimeout(() => {
                if (typeof callback === "function") {
                    if (connectErrorToThrow != null) {
                        callback(connectErrorToThrow, null);
                        reject(connectErrorToThrow);
                        return;
                    }
                    var mongo = new MongoDB_1.default(response);
                    callback(null, mongo);
                    resolve();
                }
            }, 0);
        });
    }
}
exports.default = MongoClient;
//# sourceMappingURL=MongoClient.js.map