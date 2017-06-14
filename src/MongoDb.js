import { MongodHelper } from "mongodb-prebuilt";
import mongodb from "mongodb";
import GridFs from "gridfs-stream";

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const resolvedPromise = Promise.resolve();
const defaultMongodbConfig = {
    databaseName: "clarity_transaction_dispatcher",
    ip: "127.0.0.1",
    port: "27017",
    isInMemory: false
};

export default class MongoDb {
    constructor(config) {
        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.initializingPromise = null;
        this.isInitialized = false;
    }

    startAsync() {
        if (this.initializingPromise != null) {
            return this.initializingPromise;
        } else {
            this.mongoHelper = new MongodHelper(["--port", this.config.port]);

            return this.initializingPromise = this.mongoHelper.run().then(() => {
                this.isInitialized = true;
            }).catch((error) => {

            });
        }
    }

    stopAsync() {
        var initializingPromise = this.initializingPromise;

        if (this.initializingPromise == null) {
            initializingPromise = resolvedPromise;
        }

        return initializingPromise.then(() => {
            return this.getDatabaseAsync();
        }).then((db) => {
            var promise = resolvedPromise;

            if (this.config.isInMemory) {
                promise = new Promise((resolve, reject) => {
                    db.dropDatabase((error, result) => {
                        if (error != null) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });
            }

            return promise;
        }).then(() => {
            this.mongoHelper.mongoBin.childProcess.kill();
        });
    }

    getDatabaseAsync() {
        return this.startAsync().then(() => {
            var config = this.config;
            var databaseName = config.isInMemory ? config.databaseName + "_in_memory" : config.databaseName;
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