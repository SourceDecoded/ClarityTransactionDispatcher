import mongodb from "mongodb";
import GridFs from "gridfs-stream";
import fs from "fs-extra"

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const resolvedPromise = Promise.resolve();
const defaultMongodbConfig = {
    ip: "127.0.0.1",
    port: "27017"
};

export default class MongoDb {
    constructor(config) {
        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.process = null;
    }

    getDatabaseAsync(databaseName) {
        if (databaseName == null) {
            throw new Error("Null Argrument Exception: databaseName needs to be supplied.");
        }

        var databaseUrl = `mongodb://${this.config.ip}:${this.config.port}/${databaseName}`;

        return MongoClient.connect(databaseUrl);
    }

    getGridFsAsync(databaseName) {
        return this.getDatabaseAsync(databaseName).then((db) => {
            return new GridFs(db, mongodb);
        });
    }

    getObjectID() {
        return ObjectID;
    }

}