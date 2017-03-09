"use strict";
const GridFs_1 = require("./GridFs");
const Mongo_1 = require("./Mongo");
class MongoFactory {
    constructor(config) {
        this.gridFs = new GridFs_1.default(config.gridFsConfig);
        this.mongodb = new Mongo_1.default(config.mongodbConfig);
    }
    createMongodb() {
        return this.mongodb;
    }
    createGridFs(db, mongodb) {
        return this.gridFs;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoFactory;
//# sourceMappingURL=MongoFactory.js.map