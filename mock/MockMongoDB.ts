import MongoClient from "./MongoClient";
import MongoDB from "./MongoDB";

export default class MockMongoDB {
    private _config;
    MongoClient: { connect: (databaseUrl: string, callback: (error, db: MongoDB) => void) => void };

    constructor(config: { connectErrorToThrow?: any, collectionErrorToThrow?: any, collectionMethodErrorToThrow?: any, collectionMethodResult?: any }) {
        this._config = <any>config || {};
        this.MongoClient = new MongoClient(this._config);
    }

    ObjectID (name) {
        return btoa(name);
    }
}
