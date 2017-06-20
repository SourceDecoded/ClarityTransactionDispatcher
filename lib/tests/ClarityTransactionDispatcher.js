"use strict";

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _index = require("./../index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["ClarityTransactionDispatcher.constructor: Empty"] = function () {
    try {

        var dispatcher = new _index.ClarityTransactionDispatcher();
        _assert2.default.fail(true, "Expected the constructor to throw an error.");
    } catch (error) {}
};

exports["ClarityTransactionDispatcher.constructor: With MongoDb"] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
};

exports["ClarityTransactionDispatcher.startAsync"] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(function () {
        _assert2.default.equal(mongoDb.isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.stopAsync"] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(function () {
        _assert2.default.equal(mongoDb.isInitialized, true);
        return dispatcher.stopAsync();
    }).then(function () {
        _assert2.default.equal(mongoDb.isInitialized, false);
    });
};

exports["ClarityTransactionDispatcher.addEntityAsync without invoking startAsync."] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var entity = {};

    try {
        dispatcher.addEntityAsync(entity);
        _assert2.default.fail(true, "Expected to throw an error without invoking startAsync first.");
    } catch (error) {}
};

exports["ClarityTransactionDispatcher.addEntityAsync."] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(function () {
        return dispatcher.addEntityAsync({ components: [{ type: "test" }] });
    }).then(function () {
        return mongoDb.getDatabaseAsync();
    }).then(function (db) {
        var collection = db.collection("entities");
        var json = collection.toJSON();
    });
};

exports["ClarityTransactionDispatcher.addServiceAsync without invoking startAsync."] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    try {
        dispatcher.addServiceAsync();
        _assert2.default.fail(true, "Expected to throw an error without invoking startAsync first.");
    } catch (error) {}
};

exports["ClarityTransactionDispatcher.addServiceAsync."] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var service = {};

    dispatcher.startAsync().then(function () {
        return dispatcher.addServiceAsync("myService", service);
    }).then(function () {
        _assert2.default.equal(dispatcher.services["myService"], service);
    });
};

exports["ClarityTransactionDispatcher.addSystemAsync."] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;

    var system = {
        activatedAsync: function activatedAsync() {
            isActivated = true;
        },
        initilizeAsync: function initilizeAsync() {
            isInitialized = true;
        },
        getGuid: function getGuid() {
            return "test";
        },
        getName: function getName() {
            return "Test";
        }
    };

    dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        _assert2.default.equal(isActivated, true);
        _assert2.default.equal(isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.deactivateSystemAsync."] = function () {
    var mongoDb = new _index.MockMongoDb();
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;
    var isDeactivated = false;

    var system = {
        activatedAsync: function activatedAsync() {
            isActivated = true;
        },
        initilizeAsync: function initilizeAsync() {
            isInitialized = true;
        },
        deactivatedAsync: function deactivatedAsync() {
            isDeactivated = true;
        },
        getGuid: function getGuid() {
            return "test";
        },
        getName: function getName() {
            return "Test";
        }
    };

    dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        _assert2.default.equal(isActivated, true);
        _assert2.default.equal(isInitialized, true);
    }).then(function () {
        return dispatcher.deactivateSystemAsync(system);
    }).then(function () {
        _assert2.default.equal(isDeactivated, true);
    });
};
//# sourceMappingURL=ClarityTransactionDispatcher.js.map