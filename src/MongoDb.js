import { MongodHelper } from "mongodb-prebuilt";
import mongodb from "mongodb";
import GridFs from "gridfs-stream";
import fs from "fs-extra"

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const resolvedPromise = Promise.resolve();
const dbpath = /^win/.test(process.platform) ? "c:/data/db" : "/data/db";
const defaultMongodbConfig = {
    ip: "127.0.0.1",
    args: ["--port", "27017", "--dbpath", dbpath]
};

const mongoProcesses = {};

class MongoProcess {
    constructor(args) {
        this.args = args;
        this.mongoHelper = null;
        this.initializingPromise = null;
        this.isInitialized = false;
        this.connections = 0;
    }

    startAsync() {

        if (this.initializingPromise == null) {
            this.mongoHelper = new MongodHelper(this.args);
            this.initializingPromise = this.mongoHelper.run();
        }

        return this.initializingPromise.then(() => {
            this.connections++;
            this.isInitialized = true;
        });
    }

    stopAsync() {
        if (this.initializingPromise != null) {
            return this.initializingPromise.then(() => {
                this.connections--;
                if (this.connections === 0) {
                    try {
                        this.mongoHelper.mongoBin.childProcess.kill();
                        this.mongoHelper = null;
                        this.initializingPromise = null;
                        this.isInitialized = false;
                    } catch (error) {
                    }
                }
            });
        } else {
            return resolvedPromise;
        }
    }

}

export default class MongoDb {
    constructor(config) {
        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.process = null;
    }

    get isInitialized() {
        return this.process.isInitialized;
    }

    _getDbPath() {
        return this._getArgValue("--dbpath");
    }

    _getPort() {
        return this._getArgValue("--port");
    }

    _getArgValue(name) {
        var dbpathIndex = this.config.args.indexOf(name);
        var customDbPath = dbpathIndex > -1 ? this.config.args[dbpathIndex + 1] : dbpath;
        return customDbPath;
    }

    startAsync() {
        var args = this.config.args;
        var port = this._getPort();
        var ip = this.config.ip;
        var key = `${ip}|${port}`;

        var process = mongoProcesses[key];

        if (process == null) {
            process = mongoProcesses[key] = new MongoProcess(args);
        }

        this.process = process;

        return process.startAsync();
    }

    stopAsync() {
        var args = this.config.args;
        var port = this._getPort();
        var ip = this.config.ip;
        var key = `${ip}|${port}`;

        var process = mongoProcesses[key];

        if (process == null) {
            return resolvedPromise;
        }

        return process.stopAsync();
    }

    getDatabaseAsync(databaseName) {
        if (databaseName == null) {
            throw new Error("Null Argrument Exception: databaseName needs to be supplied.");
        }

        return this.startAsync().then(() => {
            var config = this.config;
            var databaseUrl = `mongodb://${config.ip}:${this._getPort()}/${databaseName}`;

            return MongoClient.connect(databaseUrl);
        });
    }

    getGridFsAsync(databaseName) {
        this.startAsync().then(() => {
            return this.getDatabaseAsync(databaseName);
        }).then((db) => {
            return new GridFs(db, mongodb);
        });
    }

    getObjectID() {
        return ObjectID;
    }


}