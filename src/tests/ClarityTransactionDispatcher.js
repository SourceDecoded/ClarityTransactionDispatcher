import assert from "assert";
import { ClarityTransactionDispatcher, MockMongoDb } from "./../index";

exports["ClarityTransactionDispatcher.constructor: Empty"] = function () {
    try {

        var dispatcher = new ClarityTransactionDispatcher();
        assert.fail(true, "Expected the constructor to throw an error.");

    } catch (error) {

    }
};

exports["ClarityTransactionDispatcher.constructor: With MongoDb"] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
};

exports["ClarityTransactionDispatcher.startAsync"] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(() => {
        assert.equal(mongoDb.isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.stopAsync"] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(() => {
        assert.equal(mongoDb.isInitialized, true);
        return dispatcher.stopAsync();
    }).then(() => {
        assert.equal(mongoDb.isInitialized, false);
    });
};

exports["ClarityTransactionDispatcher.addEntityAsync without invoking startAsync."] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var entity = {};

    try {
        dispatcher.addEntityAsync(entity);
        assert.fail(true, "Expected to throw an error without invoking startAsync first.");
    } catch (error) {

    }
};

exports["ClarityTransactionDispatcher.addEntityAsync."] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    return dispatcher.startAsync().then(() => {
        return dispatcher.addEntityAsync({ components: [{ type: "test" }] });
    }).then(() => {
        return mongoDb.getDatabaseAsync();
    }).then((db) => {
        var collection = db.collection("entities");
        var json = collection.toJSON();
    });
};

exports["ClarityTransactionDispatcher.addServiceAsync without invoking startAsync."] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    try {
        dispatcher.addServiceAsync();
        assert.fail(true, "Expected to throw an error without invoking startAsync first.");
    } catch (error) {

    }
};

exports["ClarityTransactionDispatcher.addServiceAsync."] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var service = {};

    dispatcher.startAsync().then(() => {
        return dispatcher.addServiceAsync("myService", service);
    }).then(() => {
        assert.equal(dispatcher.services["myService"], service);
    });
};


exports["ClarityTransactionDispatcher.addSystemAsync."] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;

    var system = {
        activatedAsync: () => {
            isActivated = true;
        },
        initilizeAsync: () => {
            isInitialized = true;
        },
        getGuid: () => {
            return "test"
        },
        getName: () => {
            return "Test"
        }
    };

    dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        assert.equal(isActivated, true);
        assert.equal(isInitialized, true);
    });
};

exports["ClarityTransactionDispatcher.deactivateSystemAsync."] = function () {
    var mongoDb = new MockMongoDb();
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);

    var isActivated = false;
    var isInitialized = false;
    var isDeactivated = false;

    var system = {
        activatedAsync: () => {
            isActivated = true;
        },
        initilizeAsync: () => {
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

    dispatcher.startAsync().then(() => {
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