"use strict";
const MongoClient_1 = require("./MongoClient");
class MockMongoDB {
    constructor(config) {
        this._config = config || {};
        this.MongoClient = new MongoClient_1.default(this._config);
    }
    ObjectID(name) {
        return btoa(name);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MockMongoDB;
//# sourceMappingURL=MockMongoDB.js.map