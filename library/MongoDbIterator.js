"use strict";
const mongodb_1 = require("mongodb");
class MongoDbIterator {
    constructor(config) {
        config = config || { MongoClient: null, collectionName: null, databaseUrl: null };
        this.lastId = null;
        this.MongoClient = config.MongoClient;
        this.collectionName = config.collectionName;
        this.databaseUrl = config.databaseUrl;
        this.pageSize = config.pageSize || 10;
        if (this.MongoClient == null || this.collectionName == null || this.databaseUrl == null) {
            throw new Error("MongoDbIterator needs to have MongoClient, databaseUrl, and a collectionName to iterate.");
        }
    }
    _getDatabaseAsync() {
        return new Promise((resolve, reject) => {
            mongodb_1.MongoClient.connect(this.databaseUrl, (error, db) => {
                if (error != null) {
                    reject(error);
                }
                else {
                    resolve(db);
                }
            });
        });
    }
    _getLastId(results) {
        if (results.length > 0) {
            return results[results.length - 1]._id;
        }
        return null;
    }
    /**
     * Get the next batch of entities.
     * @returns {Promise<Array>}
     */
    nextAsync() {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                var query;
                if (this.lastId == null) {
                    query = db.collection(this.collectionName).find().limit(this.pageSize);
                }
                else {
                    query = db.collection(this.collectionName).find({
                        _id: {
                            $gt: mongodb_1.default.ObjectID(this.lastId)
                        }
                    }).limit(this.pageSize);
                }
                query.toArray((error, results) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        var lastId = this._getLastId(results);
                        if (lastId != null) {
                            this.lastId = lastId;
                        }
                        resolve(results);
                    }
                });
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MongoDbIterator;
//# sourceMappingURL=MongoDbIterator.js.map