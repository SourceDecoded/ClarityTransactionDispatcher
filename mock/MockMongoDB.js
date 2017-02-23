"use strict";
const MongoClient_1 = require("./MongoClient");
const ObjectID_1 = require("./ObjectID");
class MockMongoDB {
    constructor(config) {
        this._config = config || {};
        this.MongoClient = new MongoClient_1.default(this._config);
        this.ObjectID = ObjectID_1.default;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MockMongoDB;
//# sourceMappingURL=MockMongoDB.js.map