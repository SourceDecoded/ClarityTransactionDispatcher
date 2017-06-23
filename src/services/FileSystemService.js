export default class FileSystemService {
    constructor(mongoDb) {
        if (mongoDb == null) {
            throw new Error("Null Argument exception: There needs to be a MongoDb.");
        }

        this.mongoDb = mongoDb;
    }

    getFileReadStreamByIdAsync(id) {
        return this.mongoDb.getGridFsAsync().then((gfs) => {
            return gfs.createReadStream({
                _id: this.ObjectID(id)
            });
        }).catch(error => {
            throw error;
        });
    }

    getFileWriteStreamByIdAsync(id) {
        let newFileId = id ? this.ObjectID(id) : this.ObjectID()

        return this.mongoDb.getGridFsAsync().then((gfs) => {
            return gfs.createWriteStream({
                _id: id
            });
        }).catch(error => {
            throw error;
        });
    }

    removeFileByIdAsync(id) {
        return this.mongoDb.getGridFsAsync().then((gfs) => {
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