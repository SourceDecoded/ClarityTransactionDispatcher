var assert = require("assert");
var ClarityTransactionDispatcher = require("./../library/ClarityTransactionDispatcher").default;
var MockMongo = require("./../mock/MockMongoDB").default;

exports["ClarityTransactionDispatcher: Successfully invoking addEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionMethodResult: entity }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.addEntityAsync(entity).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking addEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionErrorToThrow: "ERROR" }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.addEntityAsync(entity).then(() => {
        assert.fail();
    }).catch((error) => {
        assert.ok(true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addComponentAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "Test"
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionMethodResult: entity }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.addComponentAsync(entity, component).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking addComponentAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "Test"
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionErrorToThrow: "ERROR" }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.addComponentAsync(entity, component).then(() => {
        assert.fail();
    }).catch((error) => {
        assert.ok(true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addServiceAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    dispatcher.addServiceAsync("test", {}).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addSystemAsync."] = function () {
    var calledActivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    var system = {
        activatedAsync: function () {
            calledActivated = true;
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        assert.equal(calledActivated, true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking addSystemAsync."] = function () {
    var calledActivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    var system = {
        activatedAsync: function () {
            calledActivated = true;
            return Promise.reject(new Error("BAD"));
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        assert.fail();
    }).catch((error) => {
        assert.equal(calledActivated, true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking deactivateSystemAsync."] = function () {
    var calledDeactivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    var system = {
        deactivatedAsync: function () {
            calledDeactivated = true;
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.deactivateSystemAsync(system);
    }).then(() => {
        assert.equal(calledDeactivated, true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking deactivateSystemAsync."] = function () {
    var calledDeactivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    var system = {
        deactivatedAsync: function () {
            calledDeactivated = true;
            return Promise.reject(new Error("BAD"));
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.deactivateSystemAsync(system);
    }).then(() => {
        assert.fail();
    }).catch((error) => {
        assert.equal(calledDeactivated, true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking disposeSystemAsync."] = function () {
    var calledDispose = false;

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    var system = {
        disposeAsync: function () {
            calledDispose = true;
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.disposeSystemAsync(system);
    }).then(() => {
        assert.equal(calledDispose, true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking disposeSystemAsync."] = function () {
    var calledDispose = false;

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    var system = {
        disposeAsync: function () {
            calledDispose = true;
            return Promise.reject(new Error("BAD"));
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.disposeSystemAsync(system);
    }).then(() => {
        assert.fail();
    }).catch((error) => {
        assert.equal(calledDispose, true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentAsync."] = function () {
    var component = {
        _id: 1,
        type: "Test"
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionMethodResult: component }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getComponentAsync(component._id).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentAsync."] = function () {
    var component = {
        _id: 1,
        type: "Test"
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionErrorToThrow: "ERROR" }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getComponentAsync(component._id).then(() => {
        assert.fail(error);
    }).catch((error) => {
        assert.ok(true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionMethodResult: components }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAsync(entity).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionErrorToThrow: "ERROR" }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAsync(entity).then(() => {
        assert.fail(error);
    }).catch((error) => {
        assert.ok(true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAndTypeAsync."] = function () {
    var entity = {
        _id: 1
    };

    var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionMethodResult: components }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAndTypeAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionErrorToThrow: "ERROR" }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then(() => {
        assert.fail(error);
    }).catch((error) => {
        assert.ok(true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getEntityByIdAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionMethodResult: entity }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getEntityByIdAsync(entity._id).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getEntityByIdAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionErrorToThrow: "ERROR" }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.getEntityByIdAsync(entity._id).then(() => {
        assert.fail(error);
    }).catch((error) => {
        assert.ok(true);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getEntitiesIterator."] = function () {
    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    var iterator = dispatcher.getEntitiesIterator();

    if (iterator) {
        assert.ok(true);
    } else {
        assert.fail();
    }
};

exports["ClarityTransactionDispatcher: Successfully invoking getService."] = function () {
    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo().MongoClient,
        databaseUrl: ""
    });

    dispatcher.addServiceAsync("test", {}).then(() => {
        return dispatcher.getService("test");
    }).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking removeComponentAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionMethodResult: entity }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.addComponentAsync(entity, component).then(() => {
        return dispatcher.removeComponentAsync(component);
    }).then(() => {
        assert.ok(true);
    }).catch((error) => {
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking removeComponentAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        MongoClient: new MockMongo({ collectionErrorToThrow: "ERROR" }).MongoClient,
        databaseUrl: ""
    });

    dispatcher.addComponentAsync(entity, component).then(() => {
        return dispatcher.removeComponentAsync(component);
    }).then(() => {
        assert.fail();
    }).catch((error) => {
        assert.ok(true);
    });
};