"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
var defaultMongodbConfig = {
    ip: "127.0.0.1",
    port: "27017"
};

var MongoDb = function () {
    function MongoDb(config) {
        _classCallCheck(this, MongoDb);

        this.config = Object.assign({}, defaultMongodbConfig, config);
        this.process = null;
    }

    _createClass(MongoDb, [{
        key: "getDatabaseAsync",
        value: function getDatabaseAsync(databaseName) {
            if (databaseName == null) {
                throw new Error("Null Argrument Exception: databaseName needs to be supplied.");
            }

            var databaseUrl = "mongodb://" + this.config.ip + ":" + this.config.port + "/" + databaseName;

            return MongoClient.connect(databaseUrl);
        }
    }, {
        key: "getGridFsAsync",
        value: function getGridFsAsync(databaseName) {
            return this.getDatabaseAsync(databaseName).then(function (db) {
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