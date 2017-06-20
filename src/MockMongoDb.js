import { MongodHelper } from "mongodb-prebuilt";
import mongodb from "mongo-mock";
import GridFs from "gridfs-stream";

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectId;
const resolvedPromise = Promise.resolve();
const defaultMongodbConfig = {
    databaseName: "clarity_transaction_dispatcher",
    ip: "127.0.0.1",
    port: "27017",
    isInMemory: false
};

export default class MockMongoDb {
    constructor(config) {
        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.initializingPromise = null;
        this.isInitialized = false;
    }

    startAsync() {
        this.initializingPromise = resolvedPromise;
        this.isInitialized = true;
        return this.initializingPromise;
    }

    stopAsync() {
        this.isInitialized = false;
        this.initializingPromise = null;

        return resolvedPromise;
    }

    getDatabaseAsync() {
        return this.startAsync().then(() => {
            var config = this.config;
            var databaseName = config.databaseName;
            var databaseUrl = `mongodb://${config.ip}:${config.port}/${databaseName}`;

            return MongoClient.connect(databaseUrl);
        });
    }

    getGridFsAsync() {
        return this.getDatabaseAsync().then((db) => {
            return new GridFs(db, mongodb);
        });
    }

    getObjectID() {
        return ObjectID;
    }


}