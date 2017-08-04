"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Query = function () {
    function Query(mongoDb, collectionName) {
        _classCallCheck(this, Query);

        this.mongoDb = mongoDb;
        this.collectionName = collectionName;
        this.filter = {};
        this.sort = { _id: 1 };
        this.batchSize = 50;
        this.limit = 50;
        this.lastId = null;
        this.isLocked = false;
        this.currentRetrievedCount = 0;
    }

    _createClass(Query, [{
        key: "_assertLock",
        value: function _assertLock() {
            if (this.isLocked) {
                throw new Error("The query cannot configured after the first batch.");
            }
        }
    }, {
        key: "forEachAsync",
        value: function forEachAsync(callback) {
            var _this = this;

            if (typeof callback !== "function") {
                throw new Error("The callback argument needs to be a function.");
            }

            return this.nextAsync().then(function (results) {
                if (results == null) {
                    return Promise.resolve();
                } else {
                    results.forEach(callback);
                    return _this.forEachAsync(callback);
                }
            });
        }
    }, {
        key: "find",
        value: function find(filter) {
            this._assertLock();
            this.filter = Object.assign({}, this.filter, filter);
            return this;
        }
    }, {
        key: "sort",
        value: function sort(_sort) {
            this._assertLock();
            this.sort = Object.assign({}, this.sort, _sort);
            return this;
        }
    }, {
        key: "limit",
        value: function limit(_limit) {
            this._assertLock();
            this.limit = _limit;
            return this;
        }
    }, {
        key: "nextAsync",
        value: function nextAsync() {
            var _this2 = this;

            this.isLocked = true;

            var filter = {};

            if (this.lastId != null) {
                filter = {
                    _id: { $gt: this.lastId }
                };
            }

            var filter = Object.assign({}, this.filter, filter);

            return this.mongoDb.getDatabaseAsync().then(function (database) {
                return database.collection(_this2.collectionName).find(filter).sort(_this2.sort).limit(_this2.batchSize).toArray();
            }).then(function (results) {

                if (results.length + _this2.currentRetrievedCount > _this2.limit) {
                    var remainingCount = results.length - _this2.currentRetrievedCount;
                    results = results.slice(remainingCount);
                }

                _this2.currentRetrievedCount += results.length;

                if (results.length === 0) {
                    return null;
                } else {
                    _this2.lastId = results[results.length - 1]._id;
                    return results;
                }
            });
        }
    }, {
        key: "restart",
        value: function restart() {
            this.lastId = null;
            this.isLocked = false;
            this.currentRetrievedCount = 0;
        }
    }]);

    return Query;
}();

exports.default = Query;
//# sourceMappingURL=Query.js.map