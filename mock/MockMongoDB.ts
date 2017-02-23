import MongoClient from "./MongoClient";
import MongoDB from "./MongoDB";
import ObjectID from "./ObjectID";
import { IObjectID } from "./../library/interfaces";

export default class MockMongoDB {
    private _config;
    MongoClient: { connect: (databaseUrl: string, callback: (error, db: MongoDB) => void) => void };
    ObjectID: IObjectID;

    constructor(config: { responses: Array<{ connectErrorToThrow?: any, collectionErrorToThrow?: any, collectionMethodErrorToThrow?: any, collectionMethodResult?: any }> }) {
        this._config = <any>config || {};
        this.MongoClient = new MongoClient(this._config);
        this.ObjectID = ObjectID;
    }

}
