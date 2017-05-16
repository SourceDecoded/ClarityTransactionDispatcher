"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const socketIO = require("socket.io");
const mongodb = require("mongodb");
const Router_1 = require("./app/Router");
const TRANSACTIONS_COLLECTION = "transactions";
const UPTIMES_COLLECTION = "uptimes";
const LOGS_COLLECTION = "logs";
class DispatcherMonitorSystem {
    constructor() {
        this.clarityTransactionDispatcher;
        this.app;
        this.io;
        this.ObjectID = mongodb.ObjectID;
        this.guid = "3A07CA2A-1A79-4A79-98FE-B3FA747A9CB2";
        this.name = "Dispatcher Monitor System";
    }
    // SYSTEM PRIVATE METHODS
    _addItemToCollectionAsync(item, collectionName) {
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.insertOne(item);
        }).then((result) => {
            item._id = result.insertedId;
            return item;
        });
    }
    _addLogAsync(type, subType, message, data) {
        const log = {
            type,
            subType,
            message,
            data,
            createdDate: new Date()
        };
        return this._addItemToCollectionAsync(log, LOGS_COLLECTION);
    }
    _addTransactionAsync(type, data) {
        const transaction = {
            type,
            data,
            createdDate: new Date()
        };
        return this._addItemToCollectionAsync(transaction, TRANSACTIONS_COLLECTION);
    }
    _addUptimeAsync() {
        const uptime = {
            startDate: new Date(),
            endDate: null
        };
        return this._addItemToCollectionAsync(uptime, UPTIMES_COLLECTION);
    }
    _initAPI() {
        const router = new Router_1.default(this.app, this);
        router.init();
        this.app.listen(3006, () => console.log("Monitor Server is running locally on port 3006..."));
    }
    _initSocketIO() {
        const server = http.createServer(this.app);
        this.io = socketIO(server);
        this.io.on("connection", (client) => {
            console.log("Monitor Client listening on port 3007...");
        });
        server.listen(3007, () => console.log("Socket Monitor Server is running locally on port 3007..."));
    }
    _convertToDates(obj) {
        if (obj == null) {
            return obj;
        }
        var result = Array.isArray(obj) ? [] : {};
        Object.keys(obj).forEach((key) => {
            if (obj[key] != null && obj[key].$date != null) {
                result[key] = new Date(obj[key].$date);
            }
            else if (obj[key] != null && typeof obj[key] === "object") {
                result[key] = this._convertToDates(obj[key]);
            }
            else {
                result[key] = obj[key];
            }
        });
        return result;
    }
    _emitLogEvents(type, log) {
        this.io.emit(type, { log });
        this.io.emit("allLogs", { log });
    }
    _emitTransactionEvents(type, transaction) {
        this.io.emit(type, { transaction });
        this.io.emit("allTransactions", { transaction });
    }
    _findOneAsync(collectionName, filter) {
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.findOne(filter);
        });
    }
    _getDatabaseAsync() {
        return new Promise((resolve, reject) => {
            const url = "mongodb://localhost:27017/ClarityTransactionDispatcherMonitor";
            const MongoClient = mongodb.MongoClient;
            MongoClient.connect(url, (error, db) => {
                if (error != null) {
                    reject(error);
                }
                else {
                    resolve(db);
                }
            });
        });
    }
    // SYSTEM LIFE CYCLE AND REQUIRED METHODS
    activatedAsync(clarityTransactionDispatcher) {
        this.clarityTransactionDispatcher = clarityTransactionDispatcher;
        this.app = this.clarityTransactionDispatcher.getService("express");
        this._initAPI();
        this._initSocketIO();
        this._addUptimeAsync();
    }
    entityAddedAsync(entity) {
        const type = "entityAdded";
        this._addTransactionAsync(type, { entity }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Entity Added Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }
    entityRemovedAsync(entity) {
        const type = "entityRemoved";
        this._addTransactionAsync(type, { entity }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Entity Removed Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }
    entityRetrievedAsync(entity) {
        const type = "entityRetrieved";
        this._addTransactionAsync(type, { entity }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Entity Retrieved Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }
    entityUpdatedAsync(oldEntity, newEntity) {
        const type = "entityUpdated";
        this._addTransactionAsync(type, { oldEntity, newEntity }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Entity Updated Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }
    logError(error) {
        const type = "logError";
        this._addLogAsync("error", error.type, error.message).then(log => {
            this._emitLogEvents(type, log);
        }).catch(error => {
            console.log(error);
        });
    }
    logMessage(message) {
        const type = "logMessage";
        this._addLogAsync("message", message.type, message.message).then(log => {
            this._emitLogEvents(type, log);
        }).catch(error => {
            console.log(error);
        });
    }
    logWarning(warning) {
        const type = "logWarning";
        this._addLogAsync("warning", warning.type, warning.message).then(log => {
            this._emitLogEvents(type, log);
        }).catch(error => {
            console.log(error);
        });
    }
    getGuid() {
        return this.guid;
    }
    getName() {
        return this.name;
    }
    // SYSTEM SPECIFIC PUBLIC METHODS
    getLatestUptimeAsync() {
        return this._getDatabaseAsync().then((db) => {
            return db.collection(UPTIMES_COLLECTION).findOne({}, { sort: { $natural: -1 } });
        });
    }
    getLogByIdAsync(logId) {
        const filter = { _id: this.ObjectID(logId) };
        return this._findOneAsync(LOGS_COLLECTION, filter).then(log => {
            return log;
        });
    }
    getLogsAsync(config) {
        var lastId = config.lastId;
        var pageSize = config.pageSize < 50 ? config.pageSize : 50;
        var sort = [["_id", -1]];
        var filter = {};
        if (lastId != null) {
            filter._id = {
                $lt: this.ObjectID(lastId)
            };
        }
        return this._getDatabaseAsync().then((db) => {
            return db.collection(LOGS_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
        });
    }
    getTransactionByIdAsync(transactionId) {
        const filter = { _id: transactionId };
        return this._findOneAsync(TRANSACTIONS_COLLECTION, filter).then(transaction => {
            return transaction;
        });
    }
    getTransactionsAsync(config) {
        var lastId = config.lastId;
        var pageSize = config.pageSize < 50 ? config.pageSize : 50;
        var sort = [["_id", 1]];
        var filter = {};
        if (lastId != null) {
            filter._id = {
                $gt: this.ObjectID(lastId)
            };
        }
        return this._getDatabaseAsync().then((db) => {
            return db.collection(TRANSACTIONS_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
        });
    }
    getTransactionCountAsync(filter) {
        filter = filter ? filter : {};
        filter = this._convertToDates(filter);
        return this._getDatabaseAsync().then((db) => {
            return db.collection(TRANSACTIONS_COLLECTION);
        }).then((collection) => {
            return collection.find(filter).count();
        });
    }
    getUptimesAsync(config) {
        var lastId = config.lastId;
        var pageSize = config.pageSize < 50 ? config.pageSize : 50;
        var sort = [["_id", 1]];
        var filter = {};
        if (lastId != null) {
            filter._id = {
                $gt: this.ObjectID(lastId)
            };
        }
        return this._getDatabaseAsync().then((db) => {
            return db.collection(UPTIMES_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
        });
    }
}
exports.default = DispatcherMonitorSystem;
//# sourceMappingURL=index.js.map