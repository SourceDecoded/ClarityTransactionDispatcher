"use strict";
class MongoCursor {
    constructor(config) {
        this._config = config;
    }
    toArray(callback) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._config.collectionMethodErrorToThrow != null) {
                    callback(this._config.collectionMethodErrorToThrow, null);
                    reject(this._config.collectionMethodErrorToThrow);
                }
                else {
                    callback(null, this._config.collectionMethodResult);
                    resolve(this._config.collectionMethodResult);
                }
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoCursor;
//# sourceMappingURL=MongoCursor.js.map