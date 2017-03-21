"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoClient_1 = require("./MongoClient");
const ObjectID_1 = require("./ObjectID");
class Mongo {
    constructor(config) {
        this._config = config || {};
        this.MongoClient = new MongoClient_1.default(this._config);
        this.ObjectID = ObjectID_1.default;
    }
}
exports.default = Mongo;
//# sourceMappingURL=Mongo.js.map