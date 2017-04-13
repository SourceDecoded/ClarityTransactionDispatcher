"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileSystemService {
    constructor(config) {
        this.mongoFactory = config.mongoFactory;
        this.mongodb = this.mongoFactory.createMongodb();
        this.MongoClient = this.mongodb.MongoClient;
        this.ObjectID = this.mongodb.ObjectID;
        this.databaseUrl = config.databaseUrl;
    }
    _getDatabaseAsync() {
        return this.MongoClient.connect(this.databaseUrl);
    }
    _getGridFsAsync() {
        return this._getDatabaseAsync().then((db) => {
            return this.mongoFactory.createGridFs(db, this.mongodb);
        });
    }
    getFileReadStreamByIdAsync(id) {
        return this._getGridFsAsync().then((gfs) => {
            return gfs.createReadStream({
                _id: this.ObjectID(id)
            });
        }).catch(error => {
            throw error;
        });
    }
    getFileWriteStreamByIdAsync(id) {
        let newFileId = id ? this.ObjectID(id) : this.ObjectID();
        return this._getGridFsAsync().then((gfs) => {
            return gfs.createWriteStream({
                _id: id
            });
        }).catch(error => {
            throw error;
        });
    }
    removeFileByIdAsync(id) {
        return this._getGridFsAsync().then((gfs) => {
            return new Promise((resolve, reject) => {
                gfs.remove({
                    _id: id
                }, (error) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
}
exports.default = FileSystemService;
//# sourceMappingURL=index.js.map