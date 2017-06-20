"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodbPrebuilt = require("mongodb-prebuilt");

var _mongoMock = require("mongo-mock");

var _mongoMock2 = _interopRequireDefault(_mongoMock);

var _gridfsStream = require("gridfs-stream");

var _gridfsStream2 = _interopRequireDefault(_gridfsStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = _mongoMock2.default.MongoClient;
var ObjectID = _mongoMock2.default.ObjectId;
var resolvedPromise = Promise.resolve();
var defaultMongodbConfig = {
    databaseName: "clarity_transaction_dispatcher",
    ip: "127.0.0.1",
    port: "27017",
    isInMemory: false
};

var MockMongoDb = function () {
    function MockMongoDb(config) {
        _classCallCheck(this, MockMongoDb);

        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.initializingPromise = null;
        this.isInitialized = false;
    }

    _createClass(MockMongoDb, [{
        key: "startAsync",
        value: function startAsync() {
            this.initializingPromise = resolvedPromise;
            this.isInitialized = true;
            return this.initializingPromise;
        }
    }, {
        key: "stopAsync",
        value: function stopAsync() {
            this.isInitialized = false;
            this.initializingPromise = null;

            return resolvedPromise;
        }
    }, {
        key: "getDatabaseAsync",
        value: function getDatabaseAsync() {
            var _this = this;

            return this.startAsync().then(function () {
                var config = _this.config;
                var databaseName = config.databaseName;
                var databaseUrl = "mongodb://" + config.ip + ":" + config.port + "/" + databaseName;

                return MongoClient.connect(databaseUrl);
            });
        }
    }, {
        key: "getGridFsAsync",
        value: function getGridFsAsync() {
            return this.getDatabaseAsync().then(function (db) {
                return new _gridfsStream2.default(db, _mongoMock2.default);
            });
        }
    }, {
        key: "getObjectID",
        value: function getObjectID() {
            return ObjectID;
        }
    }]);

    return MockMongoDb;
}();

exports.default = MockMongoDb;
//# sourceMappingURL=MockMongoDb.js.map