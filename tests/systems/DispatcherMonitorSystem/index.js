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
        this._addTransactionAsync(type, { entityId: this.ObjectID(entity._id), componentId: this.ObjectID(component._id) }).then((transaction) => {
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherMonitorSystem;
//# sourceMappingURL=index.js.map