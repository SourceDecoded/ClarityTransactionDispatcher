export default class Query {

    constructor(mongoDb, collectionName) {
        this.mongoDb = mongoDb;
        this.collectionName = collectionName;
        this.filter = {};
        this.sort = {_id: 1};
        this.batchSize = 50;
        this.limit = 50;
        this.lastId = null;
        this.isLocked = false;
        this.currentRetrievedCount = 0;
    }

    _assertLock() {
        if (this.isLocked) {
            throw new Error("The query cannot configured after the first batch.");
        }
    }

    forEachAsync(callback) {
        if (typeof callback !== "function") {
            throw new Error("The callback argument needs to be a function.");
        }

        return this.nextAsync().then((results) => {
            if (results == null) {
                return Promise.resolve();
            } else {
                results.forEach(callback);
                return this.forEachAsync(callback);
            }
        });
    }

    find(filter) {
        this._assertLock();
        this.filter = Object.assign({}, this.filter, filter);
    }

    sort(sort) {
        this._assertLock();
        this.sort = Object.assign({}, this.sort, sort);
    }

    limit(limit) {
        this._assertLock();
        this.limit = limit;
    }

    nextAsync() {
        this.isLocked = true;

        var filter = {};

        if (this.lastId != null) {
            filter = {
                _id: { $gt: this.lastId }
            }
        }

        var filter = Object.assign({}, this.filter, filter);

        return mongoDb.getDatabaseAsync().then((database) => {
            return database.collection(this.collectionName).find(filter).sort(this.sort).limit(this.batchSize).toArray();
        }).then((results) => {

            if (results.length + this.currentRetrievedCount > this.limit) {
                let remainingCount = results.length - this.currentRetrievedCount;
                results = results.slice(remainingCount);
            }

            this.currentRetrievedCount += results.length;

            if (results.length === 0) {
                return null;
            } else {
                this.lastId = results[results.length - 1]._id;
                return results;
            }

        });
    }

    restart() {
        this.lastId = null;
        this.isLocked = false;
        this.currentRetrievedCount = 0;
    }

}