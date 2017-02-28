import * as mongo from "mongodb";
import { MongoClient } from "mongodb";
import { IMongoClient } from "./interfaces"

export default class MongoDbIterator {
    private lastId: string;
    private MongoClient: MongoClient;
    private collectionName: string;
    private databaseUrl: string;
    private pageSize: number;
    private skip: number;
    private isFinished: boolean;

    constructor(config: {
        MongoClient: IMongoClient;
        collectionName: string;
        databaseUrl: string;
        skip?: number;
        pageSize?: number;
        filter?: any;
    }) {
        config = config || { MongoClient: null, collectionName: null, databaseUrl: null, skip: 0, filter: null };

        this.lastId = null;
        this.MongoClient = config.MongoClient;
        this.collectionName = config.collectionName;
        this.databaseUrl = config.databaseUrl;
        this.pageSize = config.pageSize || 10;
        this.skip = config.skip || 0;

        if (this.MongoClient == null || this.collectionName == null || this.databaseUrl == null) {
            throw new Error("MongoDbIterator needs to have MongoClient, databaseUrl, and a collectionName to iterate.");
        }
    }

    _getDatabaseAsync() {
        return new Promise((resolve, reject) => {
            this.MongoClient.connect(this.databaseUrl, (error, db) => {
                if (error != null) {
                    reject(error);
                } else {
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
        if (this.isFinished) {
            return Promise.resolve(null);
        }

        return this._getDatabaseAsync().then((db: any) => {
            return new Promise((resolve, reject) => {
                var query;

                if (this.lastId == null) {
                    query = db.collection(this.collectionName).find().skip(this.skip).limit(this.pageSize);
                } else {
                    query = db.collection(this.collectionName).find({
                        _id: {
                            $gt: mongo.ObjectID(this.lastId)
                        }
                    }).limit(this.pageSize);
                }

                query.sort([["_id", 1]]).toArray((error, results) => {
                    if (error != null) {
                        reject(error);
                    } else {
                        var lastId = this._getLastId(results);

                        // Check to see if there is any more.
                        if (lastId == null) {
                            this.isFinished = true;
                        } else {
                            this.lastId = lastId;
                        }

                        resolve(results);
                    }
                });
            });
        });
    }

}