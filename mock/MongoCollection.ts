import MongoCursor from "./MongoCursor";

export default class MongoCollection {
    private _collectionMethodErrorToThrow;
    private _collectionMethodResult;
    private _config;

    constructor(config) {
        this._config = config;
        this._collectionMethodErrorToThrow = config.collectionMethodErrorToThrow || null;
        this._collectionMethodResult = config.collectionMethodResult || null;
    }

    _mockAsyncResponse (callback: (error, result: any) => void) {
        var self = this;
        setTimeout(() => {
            if (self._collectionMethodErrorToThrow != null) {
                callback(self._collectionMethodErrorToThrow, null);
                return;
            }

            callback(null, self._collectionMethodResult);
        }, 0);
    }

    insertOne(document: any, callback: (error, result: any) => void) {
        this._mockAsyncResponse(callback);
    }

    deleteOne(filter: any, callback: (error, result: any) => void) {
        this._mockAsyncResponse(callback);
    }

    update(filter: any, callback: (error, result: any) => void) { 
        this._mockAsyncResponse(callback);
    }

    find(filter: any, callback: (error, result: any) => void) {
        return new MongoCursor(this._config);
     }

    findOne(filter: any, callback: (error, result: any) => void) {
        this._mockAsyncResponse(callback);
     }
}