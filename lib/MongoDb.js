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

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = _mongodb2.default.MongoClient;
var ObjectID = _mongodb2.default.ObjectID;
var resolvedPromise = Promise.resolve();
var dbpath = /^win/.test(process.platform) ? "c:/data/db" : "~/data/db";
var defaultMongodbConfig = {
    ip: "127.0.0.1",
    args: ["--port", "27017", "--dbpath", dbpath]
};

var mongoProcesses = {};

var MongoProcess = function () {
    function MongoProcess(args) {
        _classCallCheck(this, MongoProcess);

        this.args = args;
        this.mongoHelper = null;
        this.initializingPromise = null;
        this.isInitialized = false;
        this.connections = 0;
    }

    _createClass(MongoProcess, [{
        key: "startAsync",
        value: function startAsync() {
            var _this = this;

            if (this.initializingPromise == null) {
                this.mongoHelper = new _mongodbPrebuilt.MongodHelper(this.args);
                this.initializingPromise = this.mongoHelper.run();
            }

            return this.initializingPromise.then(function () {
                _this.connections++;
                _this.isInitialized = true;
            });
        }
    }, {
        key: "stopAsync",
        value: function stopAsync() {
            var _this2 = this;

            if (this.initializingPromise != null) {
                return this.initializingPromise.then(function () {
                    _this2.connections--;
                    if (_this2.connections === 0) {
                        try {
                            _this2.mongoHelper.mongoBin.childProcess.kill();
                            _this2.mongoHelper = null;
                            _this2.initializingPromise = null;
                            _this2.isInitialized = false;
                        } catch (error) {}
                    }
                });
            } else {
                return resolvedPromise;
            }
        }
    }]);

    return MongoProcess;
}();

var MongoDb = function () {
    function MongoDb(config) {
        _classCallCheck(this, MongoDb);

        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.process = null;
    }

    _createClass(MongoDb, [{
        key: "_getDbPath",
        value: function _getDbPath() {
            return this._getArgValue("--dbpath");
        }
    }, {
        key: "_getPort",
        value: function _getPort() {
            return this._getArgValue("--port");
        }
    }, {
        key: "_getArgValue",
        value: function _getArgValue(name) {
            var dbpathIndex = this.config.args.indexOf(name);
            var customDbPath = dbpathIndex > -1 ? this.config.args[dbpathIndex + 1] : dbpath;
            return customDbPath;
        }
    }, {
        key: "startAsync",
        value: function startAsync() {
            var args = this.config.args;
            var port = this._getPort();
            var ip = this.config.ip;
            var key = ip + "|" + port;

            var process = mongoProcesses[key];

            if (process == null) {
                process = mongoProcesses[key] = new MongoProcess(args);
            }

            this.process = process;

            return process.startAsync();
        }
    }, {
        key: "stopAsync",
        value: function stopAsync() {
            var args = this.config.args;
            var port = this._getPort();
            var ip = this.config.ip;
            var key = ip + "|" + port;

            var process = mongoProcesses[key];

            if (process == null) {
                return resolvedPromise;
            }

            return process.stopAsync();
        }
    }, {
        key: "getDatabaseAsync",
        value: function getDatabaseAsync(databaseName) {
            var _this3 = this;

            if (databaseName == null) {
                throw new Error("Null Argrument Exception: databaseName needs to be supplied.");
            }

            return this.startAsync().then(function () {
                var config = _this3.config;
                var databaseUrl = "mongodb://" + config.ip + ":" + _this3._getPort() + "/" + databaseName;

                return MongoClient.connect(databaseUrl);
            });
        }
    }, {
        key: "getGridFsAsync",
        value: function getGridFsAsync(databaseName) {
            var _this4 = this;

            this.startAsync().then(function () {
                return _this4.getDatabaseAsync(databaseName);
            }).then(function (db) {
                return new _gridfsStream2.default(db, _mongodb2.default);
            });
        }
    }, {
        key: "getObjectID",
        value: function getObjectID() {
            return ObjectID;
        }
    }, {
        key: "isInitialized",
        get: function get() {
            return this.process.isInitialized;
        }
    }]);

    return MongoDb;
}();

exports.default = MongoDb;
//# sourceMappingURL=MongoDb.js.map