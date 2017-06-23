"use strict";

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _index = require("./../index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoDb = null;

exports.clean = function () {
    return mongoDb.getDatabaseAsync().then(function (db) {
        return Promise.all([db.collection("entities").remove({}), db.collection("systemData").remove({})]);
    });
};

exports.prepare = function () {
    mongoDb = new _index.MongoDb({
        isInMemory: true
    });
    return mongoDb.startAsync();
};

exports.destroy = function () {};

exports["ClarityTransactionDispatcher.constructor: Empty"] = function () {
    _assert2.default.throws(function (error) {
        var dispatcher = new _index.ClarityTransactionDispatcher();
    }, "Expected the constructor to throw an error.");
};

exports["ClarityTransactionDispatcher.constructor: With MongoDb"] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
};

exports["ClarityTransactionDispatcher.startAsync"] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(function () {
        _assert2.default.equal(mongoDb.isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.stopAsync"] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(function () {
        _assert2.default.equal(mongoDb.isInitialized, true);
        return dispatcher.stopAsync();
    }).then(function () {
        _assert2.default.equal(mongoDb.isInitialized, false);
    });
};

exports["ClarityTransactionDispatcher.addEntityAsync without invoking startAsync."] = function () {
    _assert2.default.throws(function () {
        var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
        var entity = {};
        dispatcher.addEntityAsync(entity);
    }, "Expected to throw an error without invoking startAsync first.");
};

exports["ClarityTransactionDispatcher.addEntityAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var collection = null;

    return dispatcher.startAsync().then(function () {
        return dispatcher.addEntityAsync({ components: [{ type: "test" }] });
    }).then(function () {
        return mongoDb.getDatabaseAsync();
    }).then(function (db) {
        collection = db.collection("entities");
        return collection.find().toArray();
    }).then(function (results) {
        _assert2.default.equal(results.length, 1);
    }).then(function () {
        return collection.remove({});
    });
};

exports["ClarityTransactionDispatcher.addServiceAsync without invoking startAsync."] = function () {
    _assert2.default.throws(function () {
        var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
        dispatcher.addServiceAsync({});
    }, "Expected to throw an error without invoking startAsync first.");
};

exports["ClarityTransactionDispatcher.addServiceAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var service = {};

    return dispatcher.startAsync().then(function () {
        return dispatcher.addServiceAsync("myService", service);
    }).then(function () {
        _assert2.default.equal(dispatcher.services["myService"], service);
    });
};

exports["ClarityTransactionDispatcher.addSystemAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;

    var system = {
        activatedAsync: function activatedAsync() {
            isActivated = true;
        },
        initializeAsync: function initializeAsync() {
            isInitialized = true;
        },
        getGuid: function getGuid() {
            return "test";
        },
        getName: function getName() {
            return "Test";
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        _assert2.default.equal(isActivated, true);
        _assert2.default.equal(isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.deactivateSystemAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;
    var isDeactivated = false;

    var system = {
        activatedAsync: function activatedAsync() {
            isActivated = true;
        },
        initializeAsync: function initializeAsync() {
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

    return dispatcher.startAsync().then(function () {
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

exports["ClarityTransactionDispatcher.disposeSystemAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;
    var isDeactivated = false;
    var isDisposed = false;

    var system = {
        activatedAsync: function activatedAsync() {
            isActivated = true;
        },
        initializeAsync: function initializeAsync() {
            isInitialized = true;
        },
        deactivatedAsync: function deactivatedAsync() {
            isDeactivated = true;
        },
        disposeAsync: function disposeAsync() {
            isDisposed = true;
        },
        getGuid: function getGuid() {
            return "test";
        },
        getName: function getName() {
            return "Test";
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        _assert2.default.equal(isActivated, true);
        _assert2.default.equal(isInitialized, true);
    }).then(function () {
        return dispatcher.disposeSystemAsync(system);
    }).then(function () {
        _assert2.default.equal(isDeactivated, false);
        _assert2.default.equal(isDisposed, true);
    });
};

exports["ClarityTransactionDispatcher.getEntitiesAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var today = new Date();
    today.setTime(0, 0, 0, 0);

    return dispatcher.startAsync().then(function () {
        return dispatcher.addEntityAsync({ components: [{ type: "test1" }] });
    }).then(function () {
        return dispatcher.addEntityAsync({ components: [{ type: "test2" }] });
    }).then(function () {
        return dispatcher.getEntitiesAsync({
            pageSize: 1,
            lastCreatedDate: today,
            lastModifiedDate: today
        });
    }).then(function (results) {
        var entity = results[0];

        _assert2.default.equal(results.length, 1);
        _assert2.default.equal(entity.components[0].type, "test1");

        return dispatcher.getEntitiesAsync({
            pageSize: 1,
            lastId: results[0]._id,
            lastCreatedDate: entity.createDate,
            lastModifiedDate: entity.modifiedDate
        });
    }).then(function (results) {
        var entity = results[0];

        _assert2.default.equal(results.length, 1);
        _assert2.default.equal(entity.components[0].type, "test2");
    });
};

exports["ClarityTransactionDispatcher.getEntityByIdAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var today = new Date();
    today.setTime(0, 0, 0, 0);

    return dispatcher.startAsync().then(function () {
        return dispatcher.addEntityAsync({ components: [{ type: "test1" }] });
    }).then(function () {
        return dispatcher.getEntitiesAsync({
            pageSize: 1
        });
    }).then(function (results) {
        var entity = results[0];

        _assert2.default.equal(results.length, 1);
        _assert2.default.equal(entity.components[0].type, "test1");

        return dispatcher.getEntityByIdAsync(entity._id.toString());
    }).then(function (entity) {
        _assert2.default.equal(entity.components[0].type, "test1");
    });
};

exports["ClarityTransactionDispatcher.getEntityCountAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var today = new Date();
    today.setTime(0, 0, 0, 0);

    return dispatcher.startAsync().then(function () {
        return dispatcher.addEntityAsync({ components: [{ type: "test1" }] });
    }).then(function () {
        return dispatcher.getEntityCountAsync();
    }).then(function (count) {
        _assert2.default.equal(count, 1);
    });
};

exports["ClarityTransactionDispatcher.getService."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var service = {};

    return dispatcher.startAsync().then(function () {
        return dispatcher.addServiceAsync("testService", service);
    }).then(function () {
        _assert2.default.equal(service, dispatcher.getService("testService"));
    });
};

exports["ClarityTransactionDispatcher.getSystems."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var system = {
        getGuid: function getGuid() {},
        getName: function getName() {}
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        var systems = dispatcher.getSystems();

        _assert2.default.equal(systems.length, 1);
    });
};

exports["ClarityTransactionDispatcher.logError."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var hasLogged = false;
    var system = {
        getGuid: function getGuid() {},
        getName: function getName() {},
        logError: function logError() {
            hasLogged = true;
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        dispatcher.logError(new Error("Something bad happened."));
        _assert2.default.equal(hasLogged, true);
    });
};

exports["ClarityTransactionDispatcher.logMessage."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var hasLogged = false;
    var _logMessage = null;

    var system = {
        getGuid: function getGuid() {},
        getName: function getName() {},
        logMessage: function logMessage(message) {
            _logMessage = message;
            hasLogged = true;
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        dispatcher.logMessage("Message");
        _assert2.default.equal(_logMessage, "Message");
        _assert2.default.equal(hasLogged, true);
    });
};

exports["ClarityTransactionDispatcher.logWarning."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var hasLogged = false;
    var logMessage = null;

    var system = {
        getGuid: function getGuid() {},
        getName: function getName() {},
        logWarning: function logWarning(message) {
            logMessage = message;
            hasLogged = true;
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        dispatcher.logWarning("Message");
        _assert2.default.equal(logMessage, "Message");
        _assert2.default.equal(hasLogged, true);
    });
};

exports["ClarityTransactionDispatcher.removeEntityAsync: Approve removal."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var askedForApproval = false;

    var system = {
        getGuid: function getGuid() {},
        getName: function getName() {},
        approveEntityToBeRemovedAsync: function approveEntityToBeRemovedAsync(entity) {
            askedForApproval = true;
            return Promise.resolve(null);
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        return dispatcher.addEntityAsync({
            components: [{
                type: "test"
            }]
        });
    }).then(function (entity) {
        return dispatcher.removeEntityAsync(entity);
    }).then(function () {
        return dispatcher.getEntitiesAsync();
    }).then(function (entities) {
        _assert2.default.equal(entities.length, 0);
        _assert2.default.equal(askedForApproval, true);
    });
};

exports["ClarityTransactionDispatcher.removeEntityAsync: Reject removal."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var askedForApproval = false;
    var threw = false;

    var system = {
        getGuid: function getGuid() {},
        getName: function getName() {},
        approveEntityToBeRemovedAsync: function approveEntityToBeRemovedAsync(entity) {
            askedForApproval = true;
            return Promise.reject(null);
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        return dispatcher.addEntityAsync({
            components: [{
                type: "test"
            }]
        });
    }).then(function (entity) {
        return dispatcher.removeEntityAsync(entity);
    }).catch(function () {
        threw = true;
    }).then(function () {
        return dispatcher.getEntitiesAsync();
    }).then(function (entities) {
        _assert2.default.equal(entities.length, 1);
        _assert2.default.equal(askedForApproval, true);
        _assert2.default.equal(threw, true);
    });
};

exports["ClarityTransactionDispatcher.removeServiceAsync: Remove existing service."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var service = {};

    return dispatcher.startAsync().then(function () {
        return dispatcher.addServiceAsync("test", service);
    }).then(function () {
        _assert2.default.equal(dispatcher.getService("test"), service);
    }).then(function () {
        return dispatcher.removeServiceAsync("test");
    }).then(function () {
        _assert2.default.equal(dispatcher.getService("test"), null);
    });
};

exports["ClarityTransactionDispatcher.removeServiceAsync: Remove non-existing service, expect it to throw."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var service = {};

    return dispatcher.startAsync().then(function () {
        dispatcher.removeServiceAsync("test").then(function () {
            _assert2.default.fail(true);
        }).catch(function (error) {
            _assert2.default.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher.startAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(function () {
        _assert2.default.equal(dispatcher.isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.stopAsync."] = function () {
    var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);
    var isDeactivated = false;

    var system = {
        deactivatedAsync: function deactivatedAsync() {
            isDeactivated = true;
        },
        getName: function getName() {
            return "Test";
        },
        getGuid: function getGuid() {
            return "Test";
        }
    };

    return dispatcher.startAsync().then(function () {
        return dispatcher.addSystemAsync(system);
    }).then(function () {
        return dispatcher.stopAsync();
    }).then(function () {
        _assert2.default.equal(isDeactivated, true);
    });
};

// exports["ClarityTransactionDispatcher.updateEntityAsync."] = function () {
//     var dispatcher = new ClarityTransactionDispatcher(mongoDb);
//     var isDeactivated = false;

//     var system = {
//         prepareEntityToBeUpdatedAsync: (entity) => {
//             return Promise.resolve();
//         },
//         validateEntityToBeUpdatedAsync:(entity)=>{
//             return Promise.resolve();
//         },
//         getName: ()=>{
//             return "Test";
//         },
//         getGuid: ()=>{
//             return "Test";
//         }
//     };

//     return dispatcher.startAsync().then(() => {
//         return dispatcher.addSystemAsync(system);
//     }).then(() => {
//         return dispatcher.stopAsync();
//     }).then(() => {
//         assert.equal(isDeactivated, true);
//     });
// };
//# sourceMappingURL=ClarityTransactionDispatcher.js.map