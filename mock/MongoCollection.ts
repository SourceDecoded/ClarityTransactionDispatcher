export default class MongoCollection {
    private _collectionMethodErrorToThrow;
    private _collectionMethodResult;

    constructor(config) {
        this._collectionMethodErrorToThrow = config.collectionMethodErrorToThrow || null;
        this._collectionMethodResult = config.collectionMethodResult || null;
    }

    _mockAsyncResponse (callback: (error, result: any) => void) {
        setTimeout(() => {
            if (this._collectionMethodErrorToThrow != null) {
                callback(this._collectionMethodErrorToThrow, null);
                return;
            }

            callback(null, this._collectionMethodResult);
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
        this._mockAsyncResponse(callback);
     }

    findOne(filter: any, callback: (error, result: any) => void) {
        this._mockAsyncResponse(callback);
     }
}