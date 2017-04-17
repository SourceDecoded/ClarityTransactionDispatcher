"use strict";
const GridFs = require("gridfs-stream");
const mongodb = require("mongodb");
class MongoFactory {
    createMongodb() {
        return mongodb;
    }
    createGridFs(db, mongodb) {
        return new GridFs(db, mongodb);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoFactory;
//# sourceMappingURL=MongoFactory.js.map