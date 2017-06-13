"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _socket = require("socket.io");

var _socket2 = _interopRequireDefault(_socket);

var _mongodb = require("mongodb");

var _mongodb2 = _interopRequireDefault(_mongodb);

var _Router = require("./app/Router");

var _Router2 = _interopRequireDefault(_Router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TRANSACTIONS_COLLECTION = "transactions";
var UPTIMES_COLLECTION = "uptimes";
var LOGS_COLLECTION = "logs";

var DispatcherMonitorSystem = function () {
    function DispatcherMonitorSystem() {
        _classCallCheck(this, DispatcherMonitorSystem);

        this.clarityTransactionDispatcher;
        this.app;
        this.io;
        this.ObjectID = _mongodb2.default.ObjectID;
        this.guid = "3A07CA2A-1A79-4A79-98FE-B3FA747A9CB2";
        this.name = "Dispatcher Monitor System";
    }

    // SYSTEM PRIVATE METHODS


    _createClass(DispatcherMonitorSystem, [{
        key: "_addItemToCollectionAsync",
        value: function _addItemToCollectionAsync(item, collectionName) {
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.insertOne(item);
            }).then(function (result) {
                item._id = result.insertedId;
                return item;
            });
        }
    }, {
        key: "_addLogAsync",
        value: function _addLogAsync(type, subType, message, data) {
            var log = {
                type: type,
                subType: subType,
                message: message,
                data: data,
                createdDate: new Date()
            };

            return this._addItemToCollectionAsync(log, LOGS_COLLECTION);
        }
    }, {
        key: "_addTransactionAsync",
        value: function _addTransactionAsync(type, data) {
            var transaction = {
                type: type,
                data: data,
                createdDate: new Date()
            };

            return this._addItemToCollectionAsync(transaction, TRANSACTIONS_COLLECTION);
        }
    }, {
        key: "_addUptimeAsync",
        value: function _addUptimeAsync() {
            var uptime = {
                startDate: new Date(),
                endDate: null
            };

            return this._addItemToCollectionAsync(uptime, UPTIMES_COLLECTION);
        }
    }, {
        key: "_initAPI",
        value: function _initAPI() {
            var router = new _Router2.default(this.app, this);
            router.init();

            this.app.listen(3006, function () {
                return console.log("Monitor Server is running locally on port 3006...");
            });
        }
    }, {
        key: "_initSocketIO",
        value: function _initSocketIO() {
            var server = _http2.default.createServer(this.app);
            this.io = (0, _socket2.default)(server);

            this.io.on("connection", function (client) {
                console.log("Monitor Client listening on port 3007...");
            });

            server.listen(3007, function () {
                return console.log("Socket Monitor Server is running locally on port 3007...");
            });
        }
    }, {
        key: "_convertToDates",
        value: function _convertToDates(obj) {
            var _this = this;

            if (obj == null) {
                return obj;
            }

            var result = Array.isArray(obj) ? [] : {};

            Object.keys(obj).forEach(function (key) {
                if (obj[key] != null && obj[key].$date != null) {
                    result[key] = new Date(obj[key].$date);
                } else if (obj[key] != null && _typeof(obj[key]) === "object") {
                    result[key] = _this._convertToDates(obj[key]);
                } else {
                    result[key] = obj[key];
                }
            });

            return result;
        }
    }, {
        key: "_emitLogEvents",
        value: function _emitLogEvents(type, log) {
            this.io.emit(type, { log: log });
            this.io.emit("allLogs", { log: log });
        }
    }, {
        key: "_emitTransactionEvents",
        value: function _emitTransactionEvents(type, transaction) {
            this.io.emit(type, { transaction: transaction });
            this.io.emit("allTransactions", { transaction: transaction });
        }
    }, {
        key: "_findOneAsync",
        value: function _findOneAsync(collectionName, filter) {
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.findOne(filter);
            });
        }
    }, {
        key: "_getDatabaseAsync",
        value: function _getDatabaseAsync() {
            return new Promise(function (resolve, reject) {
                var url = "mongodb://localhost:27017/ClarityTransactionDispatcherMonitor";
                var MongoClient = _mongodb2.default.MongoClient;

                MongoClient.connect(url, function (error, db) {
                    if (error != null) {
                        reject(error);
                    } else {
                        resolve(db);
                    }
                });
            });
        }

        // SYSTEM LIFE CYCLE AND REQUIRED METHODS

    }, {
        key: "activatedAsync",
        value: function activatedAsync(clarityTransactionDispatcher) {
            this.clarityTransactionDispatcher = clarityTransactionDispatcher;
            this.app = this.clarityTransactionDispatcher.getService("express");

            this._initAPI();
            this._initSocketIO();
            this._addUptimeAsync();
        }
    }, {
        key: "entityAddedAsync",
        value: function entityAddedAsync(entity) {
            var _this2 = this;

            var type = "entityAdded";

            this._addTransactionAsync(type, { entity: entity }).then(function (transaction) {
                _this2._emitTransactionEvents(type, transaction);
                return transaction.data;
            }).then(function (data) {
                return _this2._addLogAsync("transaction", type, "Entity Added Successfully", data);
            }).then(function (log) {
                _this2._emitLogEvents("logTransaction", log);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "entityRemovedAsync",
        value: function entityRemovedAsync(entity) {
            var _this3 = this;

            var type = "entityRemoved";

            this._addTransactionAsync(type, { entity: entity }).then(function (transaction) {
                _this3._emitTransactionEvents(type, transaction);
                return transaction.data;
            }).then(function (data) {
                return _this3._addLogAsync("transaction", type, "Entity Removed Successfully", data);
            }).then(function (log) {
                _this3._emitLogEvents("logTransaction", log);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "entityRetrievedAsync",
        value: function entityRetrievedAsync(entity) {
            var _this4 = this;

            var type = "entityRetrieved";

            this._addTransactionAsync(type, { entity: entity }).then(function (transaction) {
                _this4._emitTransactionEvents(type, transaction);
                return transaction.data;
            }).then(function (data) {
                return _this4._addLogAsync("transaction", type, "Entity Retrieved Successfully", data);
            }).then(function (log) {
                _this4._emitLogEvents("logTransaction", log);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "entityUpdatedAsync",
        value: function entityUpdatedAsync(oldEntity, newEntity) {
            var _this5 = this;

            var type = "entityUpdated";

            this._addTransactionAsync(type, { oldEntity: oldEntity, newEntity: newEntity }).then(function (transaction) {
                _this5._emitTransactionEvents(type, transaction);
                return transaction.data;
            }).then(function (data) {
                return _this5._addLogAsync("transaction", type, "Entity Updated Successfully", data);
            }).then(function (log) {
                _this5._emitLogEvents("logTransaction", log);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "logError",
        value: function logError(error) {
            var _this6 = this;

            var type = "logError";

            this._addLogAsync("error", error.type, error.message).then(function (log) {
                _this6._emitLogEvents(type, log);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "logMessage",
        value: function logMessage(message) {
            var _this7 = this;

            var type = "logMessage";

            this._addLogAsync("message", message.type, message.message).then(function (log) {
                _this7._emitLogEvents(type, log);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "logWarning",
        value: function logWarning(warning) {
            var _this8 = this;

            var type = "logWarning";

            this._addLogAsync("warning", warning.type, warning.message).then(function (log) {
                _this8._emitLogEvents(type, log);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "getGuid",
        value: function getGuid() {
            return this.guid;
        }
    }, {
        key: "getName",
        value: function getName() {
            return this.name;
        }

        // SYSTEM SPECIFIC PUBLIC METHODS

    }, {
        key: "getLatestUptimeAsync",
        value: function getLatestUptimeAsync() {
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(UPTIMES_COLLECTION).findOne({}, { sort: { $natural: -1 } });
            });
        }
    }, {
        key: "getLogByIdAsync",
        value: function getLogByIdAsync(logId) {
            var filter = { _id: this.ObjectID(logId) };

            return this._findOneAsync(LOGS_COLLECTION, filter).then(function (log) {
                return log;
            });
        }
    }, {
        key: "getLogsAsync",
        value: function getLogsAsync(config) {
            var lastId = config.lastId;
            var pageSize = config.pageSize < 50 ? config.pageSize : 50;

            var sort = [["_id", -1]];
            var filter = {};

            if (lastId != null) {
                filter._id = {
                    $lt: this.ObjectID(lastId)
                };
            }

            return this._getDatabaseAsync().then(function (db) {
                return db.collection(LOGS_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
            });
        }
    }, {
        key: "getTransactionByIdAsync",
        value: function getTransactionByIdAsync(transactionId) {
            var filter = { _id: transactionId };

            return this._findOneAsync(TRANSACTIONS_COLLECTION, filter).then(function (transaction) {
                return transaction;
            });
        }
    }, {
        key: "getTransactionsAsync",
        value: function getTransactionsAsync(config) {
            var lastId = config.lastId;
            var pageSize = config.pageSize < 50 ? config.pageSize : 50;

            var sort = [["_id", 1]];
            var filter = {};

            if (lastId != null) {
                filter._id = {
                    $gt: this.ObjectID(lastId)
                };
            }

            return this._getDatabaseAsync().then(function (db) {
                return db.collection(TRANSACTIONS_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
            });
        }
    }, {
        key: "getTransactionCountAsync",
        value: function getTransactionCountAsync(filter) {
            filter = filter ? filter : {};
            filter = this._convertToDates(filter);

            return this._getDatabaseAsync().then(function (db) {
                return db.collection(TRANSACTIONS_COLLECTION);
            }).then(function (collection) {
                return collection.find(filter).count();
            });
        }
    }, {
        key: "getUptimesAsync",
        value: function getUptimesAsync(config) {
            var lastId = config.lastId;
            var pageSize = config.pageSize < 50 ? config.pageSize : 50;

            var sort = [["_id", 1]];
            var filter = {};

            if (lastId != null) {
                filter._id = {
                    $gt: this.ObjectID(lastId)
                };
            }

            return this._getDatabaseAsync().then(function (db) {
                return db.collection(UPTIMES_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
            });
        }
    }]);

    return DispatcherMonitorSystem;
}();

exports.default = DispatcherMonitorSystem;
//# sourceMappingURL=index.js.map