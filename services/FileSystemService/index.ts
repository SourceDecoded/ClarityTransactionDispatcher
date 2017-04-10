import { IMongo, IMongoClient, IObjectID, IMongoFactory, IGridFs } from "../../library/interfaces";

export default class FileSystemService {
    private mongodb: IMongo;
    private mongoFactory: IMongoFactory;
    private MongoClient: IMongoClient;
    private ObjectID: IObjectID;
    private databaseUrl: string;

    constructor(config: { mongoFactory: IMongoFactory; databaseUrl: string }) {
        this.mongoFactory = config.mongoFactory;
        this.mongodb = this.mongoFactory.createMongodb();
        this.MongoClient = this.mongodb.MongoClient;
        this.ObjectID = this.mongodb.ObjectID;
        this.databaseUrl = config.databaseUrl;
    }

    private _getDatabaseAsync() {
        return this.MongoClient.connect(this.databaseUrl);
    }

    private _getGridFsAsync() {
        return this._getDatabaseAsync().then((db: any) => {
            return this.mongoFactory.createGridFs(db, this.mongodb);
        });
    }

    getFileReadStreamByIdAsync(id: string) {
        return this._getGridFsAsync().then((gfs: any) => {
            return gfs.createReadStream({
                _id: this.ObjectID(id)
            });
        }).catch(error => {
            throw error;
        });
    }

    getFileWriteStreamByIdAsync(id?: string) {
        let newFileId = id ? this.ObjectID(id) : this.ObjectID()

        return this._getGridFsAsync().then((gfs: any) => {
            return gfs.createWriteStream({
                _id: id
            });
        }).catch(error => {
            throw error;
        });
    }

    removeFileByIdAsync(id: string) {
        return this._getGridFsAsync().then((gfs: IGridFs) => {
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