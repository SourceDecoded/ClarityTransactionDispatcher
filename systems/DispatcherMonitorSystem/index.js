"use strict";
const http = require("http");
const socketIO = require("socket.io");
const mongodb = require("mongodb");
const Router_1 = require("./app/Router");
const TRANSACTIONS_COLLECTION = "transactions";
const UPTIMES_COLLECTION = "uptimes";
class DispatcherMonitorSystem {
    constructor() {
        this.clarityTransactionDispatcher;
        this.app;
        this.io;
        this.guid = "3A07CA2A-1A79-4A79-98FE-B3FA747A9CB2";
        this.name = "DispatcherMonitorSystem";
    }
    _addTransactionAsync(type, data) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(TRANSACTIONS_COLLECTION, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        const transaction = {
                            _id: null,
                            type,
                            data,
                            createdDate: new Date()
                        };
                        collection.insertOne(transaction, (error, result) => {
                            if (error != null) {
                                reject(error);
                            }
                            else {
                                transaction._id = result.insertedId;
                                resolve(transaction);
                            }
                        });
                    }
                });
            });
        });
    }
    _buildApi() {
        const router = new Router_1.default(this.app, this);
        router.init();
        this.app.listen(3007, () => console.log("Monitor Server is running locally on port 3007..."));
    }
    _connectSocketIO() {
        const server = http.createServer(this.app);
        this.io = socketIO(server);
        this.io.on("connection", (client) => {
            console.log("Monitor Client connected on port 3006...");
        });
        server.listen(3006, () => console.log("Socket Monitor Server is running locally on port 3006..."));
    }
    _createUptimeAsync() {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(UPTIMES_COLLECTION, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        const uptime = {
                            _id: null,
                            startDate: new Date(),
                            endDate: null
                        };
                        collection.insertOne(uptime, (error, result) => {
                            if (error != null) {
                                reject(error);
                            }
                            else {
                                uptime._id = result.insertedId;
                                resolve(uptime);
                            }
                        });
                    }
                });
            });
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
    activatedAsync(clarityTransactionDispatcher) {
        this.clarityTransactionDispatcher = clarityTransactionDispatcher;
        this.app = this.clarityTransactionDispatcher.getService("express");
        this._buildApi();
        this._connectSocketIO();
        this._createUptimeAsync();
    }
    entityAddedAsync(entity) {
        this.io.emit("entityAdded", { entity });
    }
    entityUpdatedAsync(oldEntity, newEntity) {
        this.io.emit("entityUpdated", { oldEntity, newEntity });
    }
    entityRemovedAsync(entity) {
        this.io.emit("entityRemoved", { entity });
    }
    entityRetrievedAsync(entity) {
        const type = "entityRetrieved";
        this._addTransactionAsync(type, { entity }).then((transaction) => {
            this.io.emit(type, { transaction });
        }).catch(error => {
            console.log(error);
        });
    }
    entityContentUpdatedAsync(oldContentId, newContentId) {
        //TODO: Add Content Support
    }
    entityComponentAddedAsync(entity, component) {
        this.io.emit("entityComponentAdded", { entity, component });
    }
    entityComponentUpdatedAsync(entity, oldComponent, newComponent) {
        this.io.emit("entityComponentUpdated", { entity, oldComponent, newComponent });
    }
    entityComponentRemovedAsync(entity, component) {
        this.io.emit("entityComponentRemoved", { entity, component });
    }
    entityComponentRetrievedAsync(entity, component) {
        this.io.emit("entityComponentRetrieved", { entity, component });
    }
    serviceRemovedAsync(name, service) {
        this.io.emit("serviceRemoved", { name, service });
    }
    getGuid() {
        return this.guid;
    }
    getName() {
        return this.name;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherMonitorSystem;
//# sourceMappingURL=index.js.map