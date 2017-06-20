"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodbPrebuilt = require("mongodb-prebuilt");

var _mongodb = require("mongodb");

var _mongodb2 = _interopRequireDefault(_mongodb);

var _gridfsStream = require("gridfs-stream");

var _gridfsStream2 = _interopRequireDefault(_gridfsStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = _mongodb2.default.MongoClient;
var ObjectID = _mongodb2.default.ObjectID;
var resolvedPromise = Promise.resolve();
var defaultMongodbConfig = {
    databaseName: "clarity_transaction_dispatcher",
    ip: "127.0.0.1",
    port: "27017",
    isInMemory: false
};

var MongoDb = function () {
    function MongoDb(config) {
        _classCallCheck(this, MongoDb);

        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.initializingPromise = null;
        this.isInitialized = false;
    }

    _createClass(MongoDb, [{
        key: "startAsync",
        value: function startAsync() {
            var _this = this;

            if (this.initializingPromise != null) {
                return this.initializingPromise;
            } else {
                this.mongoHelper = new _mongodbPrebuilt.MongodHelper(["--port", this.config.port]);

                return this.initializingPromise = this.mongoHelper.run().then(function () {
                    _this.isInitialized = true;
                }).catch(function (error) {});
            }
        }
    }, {
        key: "stopAsync",
        value: function stopAsync() {
            var _this2 = this;

            var initializingPromise = this.initializingPromise;

            if (this.initializingPromise == null) {
                initializingPromise = resolvedPromise;
            }

            return initializingPromise.then(function () {
                return _this2.getDatabaseAsync();
            }).then(function (db) {
                var promise = resolvedPromise;

                if (_this2.config.isInMemory) {
                    promise = new Promise(function (resolve, reject) {
                        db.dropDatabase(function (error, result) {
                            if (error != null) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        });
                    });
                }

                return promise;
            }).then(function () {
                _this2.mongoHelper.mongoBin.childProcess.kill();
                _this2.isInitialized = false;
                _this2.initializingPromise = null;
            });
        }
    }, {
        key: "getDatabaseAsync",
        value: function getDatabaseAsync() {
            var _this3 = this;

            return this.startAsync().then(function () {
                var config = _this3.config;
                var databaseName = config.isInMemory ? config.databaseName + "_in_memory" : config.databaseName;
                var databaseUrl = "mongodb://" + config.ip + ":" + config.port + "/" + databaseName;

                return MongoClient.connect(databaseUrl).catch(function () {});
            });
        }
    }, {
        key: "getGridFsAsync",
        value: function getGridFsAsync() {
            return this.getDatabaseAsync().then(function (db) {
                return new _gridfsStream2.default(db, _mongodb2.default);
            });
        }
    }, {
        key: "getObjectID",
        value: function getObjectID() {
            return ObjectID;
        }
    }]);

    return MongoDb;
}();

exports.default = MongoDb;
//# sourceMappingURL=MongoDb.js.map