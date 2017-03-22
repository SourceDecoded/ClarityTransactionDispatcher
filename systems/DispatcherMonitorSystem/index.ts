import * as http from "http";
import * as socketIO from "socket.io";
import * as mongodb from "mongodb";
import Router from "./app/Router";

const TRANSACTIONS_COLLECTION = "transactions";
const UPTIMES_COLLECTION = "uptimes";
const LOGS_COLLECTION = "logs";
const ALL_TRANSACTIONS = "allTransactions";
const ALL_LOGS = "allLogs";

export default class DispatcherMonitorSystem {
    clarityTransactionDispatcher: any;
    app: any;
    io: any;
    ObjectID: any;
    guid: string;
    name: string;

    constructor() {
        this.clarityTransactionDispatcher;
        this.app;
        this.io;
        this.ObjectID = mongodb.ObjectID;
        this.guid = "3A07CA2A-1A79-4A79-98FE-B3FA747A9CB2";
        this.name = "Dispatcher Monitor System";
    }

    // SYSTEM PRIVATE METHODS
    private _addItemToCollectionAsync(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.insertOne(item);
        }).then((result) => {
            item._id = result.insertedId;
            return item;
        });
    }

    private _addLogAsync(type: string, subType?: string, message?: string, data?: any) {
        const log = {
            type,
            subType,
            message,
            data,
            createdDate: new Date()
        };

        return this._addItemToCollectionAsync(log, LOGS_COLLECTION);
    }

    private _addTransactionAsync(type: string, data: any) {
        const transaction = {
            type,
            data,
            createdDate: new Date()
        };

        return this._addItemToCollectionAsync(transaction, TRANSACTIONS_COLLECTION);
    }

    private _initAPI() {
        const router = new Router(this.app, this);
        router.init();

        this.app.listen(3006, () => console.log("Monitor Server is running locally on port 3006..."));
    }

    private _connectSocketIO() {
        const server = http.createServer(this.app);
        this.io = socketIO(server);

        this.io.on("connection", (client) => {
            console.log("Monitor Client connected on port 3007...")
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
            } else if (obj[key] != null && typeof obj[key] === "object") {
                result[key] = this._convertToDates(obj[key]);
            } else {
                result[key] = obj[key]
            }
        });

        return result;
    }

    private _createLogByIdAsync(id?) {
        return this._createObjectIdAsync(id).then((objectId) => {
            return {
                _id: objectId
            };
        });
    }

    private _createTransactionByIdAsync(id?) {
        return this._createObjectIdAsync(id).then((objectId) => {
            return {
                _id: objectId
            };
        });
    }

    private _createObjectIdAsync(id) {
        try {
            id = id != null ? this.ObjectID(id) : null
            return Promise.resolve(id);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private _createUptimeAsync() {
        const uptime = {
            startDate: new Date(),
            endDate: null
        };

        return this._addItemToCollectionAsync(uptime, UPTIMES_COLLECTION);
    }

    private _emitLogEvents(type: string, log: any) {
        this.io.emit(type, { log });
        this.io.emit(ALL_LOGS, { log });
    }

    private _emitTransactionEvents(type: string, transaction: any) {
        this.io.emit(type, { transaction });
        this.io.emit(ALL_TRANSACTIONS, { transaction });
    }

    private _findOneAsync(collectionName: string, filter: any) {
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.findOne(filter);
        });
    }

    private _getDatabaseAsync() {
        return new Promise((resolve, reject) => {
            const url = "mongodb://localhost:27017/ClarityTransactionDispatcherMonitor";
            const MongoClient = mongodb.MongoClient;

            MongoClient.connect(url, (error, db) => {
                if (error != null) {
                    reject(error);
                } else {
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
        this._connectSocketIO();
        this._createUptimeAsync();
    }

    entityAddedAsync(entity) {
        const type = "entityAdded";

        return this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id) }).then((transaction) => {
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

    entityUpdatedAsync(oldEntity, newEntity) {
        const type = "entityUpdated";

        return this._addTransactionAsync(type, { oldEntityId: this.ObjectID(oldEntity._id), newEntityId: this.ObjectID(newEntity._id) }).then((transaction) => {
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

    entityRemovedAsync(entity) {
        const type = "entityRemoved";

        return this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id) }).then((transaction) => {
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

        return this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id) }).then((transaction) => {
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

    entityContentUpdatedAsync(oldContentId, newContentId) {
        const type = "entityContentUpdated";

        return this._addTransactionAsync(type, { oldContentId: this.ObjectID(oldContentId), newContentId: this.ObjectID(newContentId) }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Entity Content Updated Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }

    entityComponentAddedAsync(entity, component) {
        const type = "entityComponentAdded";

        return this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id), componentId: this.ObjectID(component._id) }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Component Added Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }

    entityComponentUpdatedAsync(entity, oldComponent, newComponent) {
        const type = "entityComponentUpdated";

        return this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id), componentId: this.ObjectID(newComponent._id) }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Component Updated Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }

    entityComponentRemovedAsync(entity, component) {
        const type = "entityComponentRemoved";

        return this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id), componentId: this.ObjectID(component._id) }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Component Removed Successfully", data);
        }).then(log => {
            this._emitLogEvents("logTransaction", log);
        }).catch(error => {
            console.log(error);
        });
    }

    entityComponentRetrievedAsync(entity, component) {
        const type = "entityComponentRetrieved";
        const entityId = entity ? this.ObjectID(entity._id) : null;

        return this._addTransactionAsync(type, { entityId, componentId: this.ObjectID(component._id) }).then((transaction) => {
            this._emitTransactionEvents(type, transaction);
            return transaction.data;
        }).then(data => {
            return this._addLogAsync("transaction", type, "Component Retrieved Successfully", data);
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
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(UPTIMES_COLLECTION).findOne({}, { sort: { $natural: -1 } })
        });
    }

    getLogByIdAsync(logId) {
        return this._createLogByIdAsync(logId).then(filter => {
            return this._findOneAsync(LOGS_COLLECTION, filter);
        }).then(log => {
            return log;
        }).catch((error) => {
            console.log(error);
        });
    }

    getLogsAsync(config: any) {
        var lastId = config.lastId;
        var pageSize = config.pageSize < 50 ? config.pageSize : 50;

        var sort = [["_id", -1]];
        var filter = <any>{};

        if (lastId != null) {
            filter._id = {
                $lt: this.ObjectID(lastId)
            };
        }

        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(LOGS_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
        });
    }

    getTransactionByIdAsync(transactionId) {
        return this._createTransactionByIdAsync(transactionId).then(filter => {
            return this._findOneAsync(TRANSACTIONS_COLLECTION, filter);
        }).then(transaction => {
            return transaction;
        }).catch((error) => {
            console.log(error);
        });
    }

    getTransactionsAsync(config: any) {
        var lastId = config.lastId;
        var pageSize = config.pageSize < 50 ? config.pageSize : 50;

        var sort = [["_id", 1]];
        var filter = <any>{};

        if (lastId != null) {
            filter._id = {
                $gt: this.ObjectID(lastId)
            };
        }

        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(TRANSACTIONS_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
        });
    }

    getTransactionCountAsync(filter) {
        filter = filter ? filter : {};
        filter = this._convertToDates(filter);

        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(TRANSACTIONS_COLLECTION);
        }).then((collection) => {
            return collection.find(filter).count();
        });
    }
}