export default class FileSystemService {
    constructor(config) {
        this.mongodb = config.mongodb;
        this.MongoClient = this.mongodb.MongoClient;
        this.ObjectID = this.mongodb.ObjectID;
        this.databaseUrl = config.databaseUrl;
        this.GridFs;
    }

     _getDatabaseAsync() {
        return this.MongoClient.connect(this.databaseUrl);
    }

     _getGridFsAsync() {
        return this._getDatabaseAsync().then((db) => {
            return new this.GridFs(db, this.mongodb);
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
        let newFileId = id ? this.ObjectID(id) : this.ObjectID()

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
                    } else {
                        resolve();
                    }
                });

            });
        });
    }
}