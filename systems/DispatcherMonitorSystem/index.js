"use strict";
const http = require("http");
const socketIO = require("socket.io");
const mongodb = require("mongodb");
const Router_1 = require("./app/Router");
const TRANSACTIONS_COLLECTION = "transactions";
const UPTIMES_COLLECTION = "uptimes";
const ALL_TRANSACTIONS = "allTransactions";
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
    _addTransactionAsync(type, data) {
        const transaction = {
            type,
            data,
            createdDate: new Date()
        };
        return this._addItemToCollectionAsync(transaction, TRANSACTIONS_COLLECTION);
    }
    _initAPI() {
        const router = new Router_1.default(this.app, this);
        router.init();
        this.app.listen(3006, () => console.log("Monitor Server is running locally on port 3006..."));
    }
    _connectSocketIO() {
        const server = http.createServer(this.app);
        this.io = socketIO(server);
        this.io.on("connection", (client) => {
            console.log("Monitor Client connected on port 3007...");
        });
        server.listen(3007, () => console.log("Socket Monitor Server is running locally on port 3007..."));
    }
    _createTransactionByIdAsync(id) {
        return this._createObjectIdAsync(id).then((objectId) => {
            return {
                _id: objectId
            };
        });
    }
    _createObjectIdAsync(id) {
        try {
            id = id != null ? this.ObjectID(id) : null;
            return Promise.resolve(id);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    _createUptimeAsync() {
        const uptime = {
            startDate: new Date(),
            endDate: null
        };
        return this._addItemToCollectionAsync(uptime, UPTIMES_COLLECTION);
    }
    _emitIOEvents(type, transaction) {
        this.io.emit(type, { transaction });
        this.io.emit(ALL_TRANSACTIONS, { transaction });
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
        this._connectSocketIO();
        this._createUptimeAsync();
    }
    entityAddedAsync(entity) {
        const type = "entityAdded";
        this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityUpdatedAsync(oldEntity, newEntity) {
        const type = "entityUpdated";
        this._addTransactionAsync(type, { oldEntityId: this.ObjectID(oldEntity._id), newEntityId: this.ObjectID(newEntity._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityRemovedAsync(entity) {
        const type = "entityRemoved";
        this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityRetrievedAsync(entity) {
        const type = "entityRetrieved";
        this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityContentUpdatedAsync(oldContentId, newContentId) {
        const type = "entityContentUpdated";
        this._addTransactionAsync(type, { oldContentId: this.ObjectID(oldContentId), newContentId: this.ObjectID(newContentId) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityComponentAddedAsync(entity, component) {
        const type = "entityComponentAdded";
        this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id), componentId: this.ObjectID(component._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityComponentUpdatedAsync(entity, oldComponent, newComponent) {
        const type = "entityComponentUpdated";
        this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id), componentId: this.ObjectID(newComponent._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityComponentRemovedAsync(entity, component) {
        const type = "entityComponentRemoved";
        this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id), componentId: this.ObjectID(component._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
        }).catch(error => {
            console.log(error);
        });
    }
    entityComponentRetrievedAsync(entity, component) {
        const type = "entityComponentRetrieved";
        const entityId = entity ? this.ObjectID(entity._id) : null;
        this._addTransactionAsync(type, { entityId, componentId: this.ObjectID(component._id) }).then((transaction) => {
            this._emitIOEvents(type, transaction);
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
    getTransactionByIdAsync(transactionId) {
        return this._createTransactionByIdAsync(transactionId).then(filter => {
            return this._findOneAsync(TRANSACTIONS_COLLECTION, filter);
        }).then(transaction => {
            return transaction;
        }).catch((error) => {
            console.log(error);
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
    convertToDates(obj) {
        if (obj == null) {
            return obj;
        }
        var result = Array.isArray(obj) ? [] : {};
        Object.keys(obj).forEach((key) => {
            if (obj[key] != null && obj[key].$date != null) {
                result[key] = new Date(obj[key].$date);
            }
            else if (obj[key] != null && typeof obj[key] === "object") {
                result[key] = this.convertToDates(obj[key]);
            }
            else {
                result[key] = obj[key];
            }
        });
        return result;
    }
    getTransactionCountAsync(filter) {
        filter = filter ? filter : {};
        filter = this.convertToDates(filter);
        return this._getDatabaseAsync().then((db) => {
            return db.collection(TRANSACTIONS_COLLECTION);
        }).then((collection) => {
            return collection.find(filter).count();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherMonitorSystem;
//# sourceMappingURL=index.js.map