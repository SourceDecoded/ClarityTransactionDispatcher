var assert = require("assert");
var ClarityTransactionDispatcher = require("./../library/ClarityTransactionDispatcher").default;
var MockMongo = require("./../mock/MockMongoDB").default;

var invokeAssert = function (callback) {
    setTimeout(callback);
};

exports["ClarityTransactionDispatcher: Successfully invoking addEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionMethodResult: entity }] }),
        databaseUrl: ""
    });

    dispatcher.addEntityAsync(entity).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking addEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] }),
        databaseUrl: ""
    });

    dispatcher.addEntityAsync(entity).then(() => {
        invokeAssert(() => {
            assert.fail();
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
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
        mongodb: new MockMongo({ responses: [{ collectionMethodResult: entity }] }),
        databaseUrl: ""
    });

    dispatcher.addComponentAsync(entity, component).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
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
        mongodb: new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] }),
        databaseUrl: ""
    });

    dispatcher.addComponentAsync(entity, component).then(() => {
        invokeAssert(() => {
            assert.fail();
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addServiceAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
        databaseUrl: ""
    });

    dispatcher.addServiceAsync("test", {}).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addSystemAsync."] = function () {
    var calledActivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
        databaseUrl: ""
    });

    var system = {
        activatedAsync: function () {
            calledActivated = true;
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        invokeAssert(() => {
            assert.equal(calledActivated, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking addSystemAsync."] = function () {
    var calledActivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
        databaseUrl: ""
    });

    var system = {
        activatedAsync: function () {
            calledActivated = true;
            return Promise.reject(new Error("BAD"));
        }
    };

    dispatcher.addSystemAsync(system).then(() => {
        invokeAssert(() => {
            assert.fail();
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(calledActivated, true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking deactivateSystemAsync."] = function () {
    var calledDeactivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
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
        invokeAssert(() => {
            assert.equal(calledDeactivated, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking deactivateSystemAsync."] = function () {
    var calledDeactivated = false;

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
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
         invokeAssert(() => {
            assert.equal(calledDeactivated, true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking disposeSystemAsync."] = function () {
    var calledDispose = false;

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
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
        invokeAssert(() => {
            assert.equal(calledDispose, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking disposeSystemAsync."] = function () {
    var calledDispose = false;

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
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
        invokeAssert(() => {
            assert.equal(calledDispose, true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentAsync."] = function () {
    var component = {
        _id: 1,
        type: "Test"
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionMethodResult: component }] }),
        databaseUrl: ""
    });

    dispatcher.getComponentAsync(component._id).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentAsync."] = function () {
    var component = {
        _id: 1,
        type: "Test"
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] }),
        databaseUrl: ""
    });

    dispatcher.getComponentAsync(component._id).then(() => {
        invokeAssert(() => {
            assert.fail(error);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionMethodResult: components }] }),
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAsync(entity).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] }),
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAsync(entity).then(() => {
        invokeAssert(() => {
            assert.fail(error);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAndTypeAsync."] = function () {
    var entity = {
        _id: 1
    };

    var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionMethodResult: components }] }),
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAndTypeAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] }),
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then(() => {
        invokeAssert(() => {
            assert.fail(error);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getEntityByIdAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionMethodResult: entity }] }),
        databaseUrl: ""
    });

    dispatcher.getEntityByIdAsync(entity._id).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getEntityByIdAsync."] = function () {
    var entity = {
        _id: 1
    };

    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] }),
        databaseUrl: ""
    });

    dispatcher.getEntityByIdAsync(entity._id).then(() => {
        invokeAssert(() => {
            assert.fail(error);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getEntitiesIterator."] = function () {
    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
        databaseUrl: ""
    });

    var iterator = dispatcher.getEntitiesIterator();

    if (iterator) {
        invokeAssert(() => {
            assert.ok(true);
        });
    } else {
        invokeAssert(() => {
            assert.fail();
        });
    }
};

exports["ClarityTransactionDispatcher: Successfully invoking getService."] = function () {
    var dispatcher = new ClarityTransactionDispatcher({
        mongodb: new MockMongo(),
        databaseUrl: ""
    });

    dispatcher.addServiceAsync("test", {}).then(() => {
        return dispatcher.getService("test");
    }).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
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
        mongodb: new MockMongo({
            responses: [
                {
                    collectionMethodResult: {}
                },
                {
                    collectionMethodResult: { entity_id: 1 }
                }
            ]
        }),
        databaseUrl: ""
    });

    dispatcher.removeComponentAsync(component).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(error);
        });
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
        mongodb: new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] }),
        databaseUrl: ""
    });

    dispatcher.addComponentAsync(entity, component).then(() => {
        return dispatcher.removeComponentAsync(component);
    }).then(() => {
        invokeAssert(() => {
            assert.fail();
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};