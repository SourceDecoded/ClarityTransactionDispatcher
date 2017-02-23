var assert = require("assert");
var ClarityTransactionDispatcher = require("./../library/ClarityTransactionDispatcher").default;
var MockMongo = require("./../mock/Mongo").default;
var MongoFactory = require("./../mock/MongoFactory").default;

var invokeAssert = function (callback) {
    setTimeout(callback);
};

exports["ClarityTransactionDispatcher: Successfully invoking addEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ result: entity }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ result: entity }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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
    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {}
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {}
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {}
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {}
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {}
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {}
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {}
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ result: component }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ result: components }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ result: components }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ result: entity }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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
    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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
    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [
                {
                    result: {}
                },
                {
                    result: { entity_id: 1 }
                }
            ]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
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

exports["ClarityTransactionDispatcher: Successfully invoking removeServiceAsync."] = function () {
    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addServiceAsync("test", {}).then(() => {
        return dispatcher.removeServiceAsync("test");
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

exports["ClarityTransactionDispatcher: Successfully invoking updateEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [
                {
                    result: {}
                },
                {
                    result: { component }
                }
            ]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.updateEntityAsync(entity, component).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher:  Error out with promise when invoking updateEntityAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.updateEntityAsync(entity, component).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking updateComponentAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

   var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [
                {
                    result: {}
                },
                {
                    result: { component }
                }
            ]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.updateComponentAsync(entity, component).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher:  Error out with promise when invoking updateComponentAsync."] = function () {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

     var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.updateComponentAsync(entity, component).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};