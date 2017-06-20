import assert from "assert";
import { ClarityTransactionDispatcher, MongoDb } from "./../index";

var mongoDb = null;

exports.clean = function () {
    return mongoDb.getDatabaseAsync().then((db) => {
        return Promise.all([
            db.collection("entities").remove({}),
            db.collection("systemData").remove({})
        ]);
    });
};

exports.prepare = function () {
    mongoDb = new MongoDb({
        isInMemory: true
    });
    return mongoDb.startAsync();
};

exports.destroy = function () {
    return mongoDb.stopAsync();
};

exports["ClarityTransactionDispatcher.constructor: Empty"] = function () {
    assert.throws((error) => {
        var dispatcher = new ClarityTransactionDispatcher();
    }, "Expected the constructor to throw an error.");
};

exports["ClarityTransactionDispatcher.constructor: With MongoDb"] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
};

exports["ClarityTransactionDispatcher.startAsync"] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(() => {
        assert.equal(mongoDb.isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.stopAsync"] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(() => {
        assert.equal(mongoDb.isInitialized, true);
        return dispatcher.stopAsync();
    }).then(() => {
        assert.equal(mongoDb.isInitialized, false);
    });
};

exports["ClarityTransactionDispatcher.addEntityAsync without invoking startAsync."] = function () {
    assert.throws(() => {
        var dispatcher = new ClarityTransactionDispatcher(mongoDb);
        var entity = {};
        dispatcher.addEntityAsync(entity);
    }, "Expected to throw an error without invoking startAsync first.");

};

exports["ClarityTransactionDispatcher.addEntityAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var collection = null;

    return dispatcher.startAsync().then(() => {
        return dispatcher.addEntityAsync({ components: [{ type: "test" }] });
    }).then(() => {
        return mongoDb.getDatabaseAsync();
    }).then((db) => {
        collection = db.collection("entities");
        return collection.find().toArray();
    }).then((results) => {
        assert.equal(results.length, 1);
    }).then(() => {
        return collection.remove({});
    });
};

exports["ClarityTransactionDispatcher.addServiceAsync without invoking startAsync."] = function () {
    assert.throws(() => {
        var dispatcher = new ClarityTransactionDispatcher(mongoDb);
        dispatcher.addServiceAsync({});
    }, "Expected to throw an error without invoking startAsync first.");

};

exports["ClarityTransactionDispatcher.addServiceAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var service = {};

    return dispatcher.startAsync().then(() => {
        return dispatcher.addServiceAsync("myService", service);
    }).then(() => {
        assert.equal(dispatcher.services["myService"], service);
    });
};

exports["ClarityTransactionDispatcher.addSystemAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;

    var system = {
        activatedAsync: () => {
            isActivated = true;
        },
        initializeAsync: () => {
            isInitialized = true;
        },
        getGuid: () => {
            return "test"
        },
        getName: () => {
            return "Test"
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        assert.equal(isActivated, true);
        assert.equal(isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.deactivateSystemAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;
    var isDeactivated = false;

    var system = {
        activatedAsync: () => {
            isActivated = true;
        },
        initializeAsync: () => {
            isInitialized = true;
        },
        deactivatedAsync: () => {
            isDeactivated = true;
        },
        getGuid: () => {
            return "test"
        },
        getName: () => {
            return "Test"
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        assert.equal(isActivated, true);
        assert.equal(isInitialized, true);
    }).then(() => {
        return dispatcher.deactivateSystemAsync(system);
    }).then(() => {
        assert.equal(isDeactivated, true);
    });
};

exports["ClarityTransactionDispatcher.disposeSystemAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;
    var isDeactivated = false;
    var isDisposed = false;

    var system = {
        activatedAsync: () => {
            isActivated = true;
        },
        initializeAsync: () => {
            isInitialized = true;
        },
        deactivatedAsync: () => {
            isDeactivated = true;
        },
        disposeAsync: () => {
            isDisposed = true;
        },
        getGuid: () => {
            return "test"
        },
        getName: () => {
            return "Test"
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        assert.equal(isActivated, true);
        assert.equal(isInitialized, true);
    }).then(() => {
        return dispatcher.disposeSystemAsync(system);
    }).then(() => {
        assert.equal(isDeactivated, false);
        assert.equal(isDisposed, true);
    });
};

exports["ClarityTransactionDispatcher.getEntitiesAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var today = new Date();
    today.setTime(0, 0, 0, 0);

    return dispatcher.startAsync().then(() => {
        return dispatcher.addEntityAsync({ components: [{ type: "test1" }] });
    }).then(() => {
        return dispatcher.addEntityAsync({ components: [{ type: "test2" }] });
    }).then(() => {
        return dispatcher.getEntitiesAsync({
            pageSize: 1,
            lastCreatedDate: today,
            lastModifiedDate: today
        });
    }).then((results) => {
        var entity = results[0];

        assert.equal(results.length, 1);
        assert.equal(entity.components[0].type, "test1");

        return dispatcher.getEntitiesAsync({
            pageSize: 1,
            lastId: results[0]._id,
            lastCreatedDate: entity.createDate,
            lastModifiedDate: entity.modifiedDate
        });
    }).then((results) => {
        var entity = results[0];

        assert.equal(results.length, 1);
        assert.equal(entity.components[0].type, "test2");
    });
};

exports["ClarityTransactionDispatcher.getEntityByIdAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var today = new Date();
    today.setTime(0, 0, 0, 0);

    return dispatcher.startAsync().then(() => {
        return dispatcher.addEntityAsync({ components: [{ type: "test1" }] });
    }).then(() => {
        return dispatcher.getEntitiesAsync({
            pageSize: 1
        });
    }).then((results) => {
        var entity = results[0];

        assert.equal(results.length, 1);
        assert.equal(entity.components[0].type, "test1");

        return dispatcher.getEntityByIdAsync(entity._id.toString());
    }).then((entity) => {
        assert.equal(entity.components[0].type, "test1");
    });
};

exports["ClarityTransactionDispatcher.getEntityCountAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var today = new Date();
    today.setTime(0, 0, 0, 0);

    return dispatcher.startAsync().then(() => {
        return dispatcher.addEntityAsync({ components: [{ type: "test1" }] });
    }).then(() => {
        return dispatcher.getEntityCountAsync();
    }).then((count) => {
        assert.equal(count, 1);
    });
};

exports["ClarityTransactionDispatcher.getService."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var service = {};
    
    dispatcher.startAsync().then(() => {
        return dispatcher.addServiceAsync("testService", service);
    }).then(() => {
        assert.equal("testService", dispatcher.getService("testService"));
    });
};

