import MongoCollection from "./MongoCollection";

export default class MongoDB {
    private _config;
    private _collections: { [key: string]: MongoCollection };
    private _collectionErrorToThrow;

    constructor(config) {
        this._config = <any>config || {};
        this._collections = {};
        this._collectionErrorToThrow = this._config.collectionErrorToThrow || null;
    }

    collection(name: string, callback: (error, MongoCollection) => void) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._collectionErrorToThrow != null) {
                    callback(this._collectionErrorToThrow, null);
                    reject(this._collectionErrorToThrow);
                    return;
                }

                var collection = this._collections[name];

                if (collection == null) {
                    collection = this._collections[name] = new MongoCollection(this._config);
                }

                callback(null, collection);
                resolve(collection);
            }, 0);
        });
    }
}