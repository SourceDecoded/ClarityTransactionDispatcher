var assert = require("assert");
var ClarityTransactionDispatcher = require("./../library/ClarityTransactionDispatcher").default;
var MockMongo = require("./../mock/Mongo").default;
var MongoFactory = require("./../mock/MongoFactory").default;

var invokeAssert = (callback) => {
    setTimeout(callback);
};

exports["ClarityTransactionDispatcher: Successfully call when invoking _addItemToCollectionAsync."] = () => {
    var entity = {
        _id: 1
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: entity }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher._addItemToCollectionAsync(entity, "entities").then((result) => {
        invokeAssert(() => {
            assert.equal(entity, result);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with collection when invoking _addItemToCollectionAsync."] = () => {
    var entity = {
        _id: 1
    };

    var expectedError = "ERROR: collectionErrorToThrow";

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionErrorToThrow: expectedError }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher._addItemToCollectionAsync(entity, "entities").then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with collection method call when invoking _addItemToCollectionAsync."] = () => {
    var entity = {
        _id: 1
    };

    var expectedError = "ERROR: collectionMethodErrorToThrow";

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodErrorToThrow: expectedError }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher._addItemToCollectionAsync(entity, "entities").then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call when invoking _initializingSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        initializeAsync: () => {
            return;
        }
    };

    var expectedResult = {
        isInitialized: true,
        systemGuid: "*TEST*"
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, { collectionMethodResult: { isInitialized: true, systemGuid: "*TEST*" } }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher._initializingSystemAsync(system).then((result) => {
        invokeAssert(() => {
            assert.deepEqual(expectedResult, result);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: entity }] }
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

exports["ClarityTransactionDispatcher: Error out with validating addEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var expectedError = "Error: validation of entity."

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        validateEntityAsync: () => {
            return Promise.reject(new Error(expectedError));
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.addEntityAsync(entity);
    }).then(() => {
        assert.ok(false);
    }).catch(error => {
        invokeAssert(() => {
            assert.equal(expectedError, error.message);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityAddedAsync on systems after addEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var entityAddedAsyncCalled = false;

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        entityAddedAsync: () => {
            entityAddedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, { collectionMethodResult: entity }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.addEntityAsync(entity);
    }).then(() => {
        assert.equal(entityAddedAsyncCalled, true);
    }).catch(error => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityAddedAsync on systems after error on first system addEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var entityAddedAsyncCalled = false;

    var system1 = {
        guid: "*TEST1*",
        name: "Test1",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        entityAddedAsync: () => {
            return Promise.reject(new Error("ERROR"));
        }
    };

    var system2 = {
        guid: "*TEST2*",
        name: "Test2",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        entityAddedAsync: () => {
            entityAddedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [
                { collectionMethodResult: { isInitialized: false, systemGuid: "*TEST1*" } },
                { collectionMethodResult: { isInitialized: false, systemGuid: "*TEST2*" } },
                { collectionMethodResult: entity },
                {},
                {}
            ]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system1).then(() => {
        return dispatcher.addSystemAsync(system2);
    }).then(() => {
        return dispatcher.addEntityAsync(entity);
    }).then(() => {
        assert.equal(entityAddedAsyncCalled, true);
    }).catch(error => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addComponentAsync."] = () => {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "Test"
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: component }] }
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
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with validating addComponentAsync."] = () => {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "Test"
    };

    var expectedError = "Error: validation of component."

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        validateComponentAsync: () => {
            return Promise.reject(new Error(expectedError));
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.addComponentAsync(entity, component);
    }).then(() => {
        assert.ok(false);
    }).catch(error => {
        invokeAssert(() => {
            assert.equal(expectedError, error.message);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityComponentAddedAsync on systems after addComponentAsync."] = () => {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "Test"
    };

    var entityComponentAddedAsyncCalled = false;

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        entityComponentAddedAsync: () => {
            entityComponentAddedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, { collectionMethodResult: component }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.addComponentAsync(entity, component);
    }).then(() => {
        assert.equal(entityComponentAddedAsyncCalled, true);
    }).catch(error => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityComponentAddedAsync on systems after error on first system addComponentAsync."] = () => {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "Test"
    };

    var entityComponentAddedAsyncCalled = false;

    var system1 = {
        guid: "*TEST1*",
        name: "Test1",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        entityComponentAddedAsync: () => {
            return Promise.reject(new Error("ERROR"));
        }
    };

    var system2 = {
        guid: "*TEST2*",
        name: "Test2",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        entityComponentAddedAsync: () => {
            entityComponentAddedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [
                { collectionMethodResult: { isInitialized: false, systemGuid: "*TEST1*" } },
                { collectionMethodResult: { isInitialized: false, systemGuid: "*TEST2*" } },
                { collectionMethodResult: component },
                {},
                {}
            ]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system1).then(() => {
        return dispatcher.addSystemAsync(system2);
    }).then(() => {
        return dispatcher.addComponentAsync(entity, component);
    }).then(() => {
        assert.equal(entityComponentAddedAsyncCalled, true);
    }).catch(error => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking addServiceAsync."] = () => {
    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{}] }
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

exports["ClarityTransactionDispatcher: Error out with validating addSystemAsync."] = () => {
    var system = {
        guid: "*TEST1*",
        name: "Test1"
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: system }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call activatedAsync on system after invoking addSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        activatedAsync: () => {
            activatedAsyncCalled = true;
        }
    };

    var activatedAsyncCalled = false;

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: system }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        invokeAssert(() => {
            assert.equal(activatedAsyncCalled, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when calling activatedAsync on system after invoking addSystemAsync."] = function () {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return this.guid;
        },
        getName: () => {
            return this.name;
        },
        activatedAsync: () => {
            return Promise.reject(new Error("ERROR"));
        }
    };

    var activatedAsyncCalled = false;

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: system }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

// exports["ClarityTransactionDispatcher: Successfully invoking deactivateSystemAsync."] = function () {
//     var calledDeactivated = false;

//     var system = {
//         guid: "1SAgd1348d9",
//         name: "test",
//         getGuid: function () {
//             return this.guid;
//         },
//         getName: function () {
//             return this.name;
//         },
//         deactivatedAsync: function () {
//             calledDeactivated = true;
//         }
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{collectionMethodResult: system}, {}] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addSystemAsync(system).then(() => {
//         return dispatcher.deactivateSystemAsync(system);
//     }).then(() => {
//         invokeAssert(() => {
//             assert.equal(calledDeactivated, true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with promise when invoking deactivateSystemAsync."] = function () {
//     var calledDeactivated = false;

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: {}
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     var system = {
//         guid: "1SAgd1348d9",
//         name: "test",
//         getGuid: function () {
//             return this.guid;
//         },
//         getName: function () {
//             return this.name;
//         },
//         deactivatedAsync: function () {
//             calledDeactivated = true;
//             return Promise.reject(new Error("BAD"));
//         }
//     };

//     dispatcher.addSystemAsync(system).then(() => {
//         return dispatcher.deactivateSystemAsync(system);
//     }).then(() => {
//         invokeAssert(() => {
//             assert.equal(calledDeactivated, true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking disposeSystemAsync."] = function () {
//     var calledDispose = false;

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{}] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     var system = {
//         guid: "1SAgd1348d9",
//         name: "test",
//         getGuid: function () {
//             return this.guid;
//         },
//         getName: function () {
//             return this.name;
//         },
//         disposeAsync: function () {
//             calledDispose = true;
//         }
//     };

//     dispatcher.addSystemAsync(system).then(() => {
//         return dispatcher.disposeSystemAsync(system);
//     }).then(() => {
//         invokeAssert(() => {
//             assert.equal(calledDispose, true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with promise when invoking disposeSystemAsync."] = function () {
//     var calledDispose = false;

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: {}
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     var system = {
//         guid: "1SAgd1348d9",
//         name: "test",
//         getGuid: function () {
//             return this.guid;
//         },
//         getName: function () {
//             return this.name;
//         },
//         disposeAsync: function () {
//             calledDispose = true;
//             return Promise.reject(new Error("BAD"));
//         }
//     };

//     dispatcher.addSystemAsync(system).then(() => {
//         return dispatcher.disposeSystemAsync(system);
//     }).then(() => {
//         invokeAssert(() => {
//             assert.equal(calledDispose, true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking getComponentAsync."] = function () {
//     var component = {
//         _id: 1,
//         type: "Test"
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ result: component }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getComponentAsync(component._id).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentAsync."] = function () {
//     var component = {
//         _id: 1,
//         type: "Test"
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getComponentAsync(component._id).then(() => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ result: components }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getComponentsByEntityAsync(entity).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getComponentsByEntityAsync(entity).then(() => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAndTypeAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ result: components }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAndTypeAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then(() => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking getEntityByIdAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ result: entity }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getEntityByIdAsync(entity._id).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with promise when invoking getEntityByIdAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.getEntityByIdAsync(entity._id).then(() => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking getEntitiesIterator."] = function () {
//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     var iterator = dispatcher.getEntitiesIterator();

//     if (iterator) {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     } else {
//         invokeAssert(() => {
//             assert.fail();
//         });
//     }
// };

// exports["ClarityTransactionDispatcher: Successfully invoking getService."] = function () {
//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addServiceAsync("test", {}).then(() => {
//         return dispatcher.getService("test");
//     }).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking removeComponentAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var component = {
//         _id: 1,
//         type: "test",
//         entity_id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: {
//             responses: [
//                 {
//                     result: {}
//                 },
//                 {
//                     result: { entity_id: 1 }
//                 }
//             ]
//         }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.removeComponentAsync(component).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with promise when invoking removeComponentAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var component = {
//         _id: 1,
//         type: "test",
//         entity_id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addComponentAsync(entity, component).then(() => {
//         return dispatcher.removeComponentAsync(component);
//     }).then(() => {
//         invokeAssert(() => {
//             assert.fail();
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking removeServiceAsync."] = function () {
//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addServiceAsync("test", {}).then(() => {
//         return dispatcher.removeServiceAsync("test");
//     }).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.fail(error);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking updateEntityAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var component = {
//         _id: 1,
//         type: "test",
//         entity_id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: {
//             responses: [
//                 {
//                     result: {}
//                 },
//                 {
//                     result: { component }
//                 }
//             ]
//         }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.updateEntityAsync(entity, component).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(false);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher:  Error out with promise when invoking updateEntityAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var component = {
//         _id: 1,
//         type: "test",
//         entity_id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.updateEntityAsync(entity, component).then(() => {
//         invokeAssert(() => {
//             assert.ok(false);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully invoking updateComponentAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var component = {
//         _id: 1,
//         type: "test",
//         entity_id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: {
//             responses: [
//                 {
//                     result: {}
//                 },
//                 {
//                     result: { component }
//                 }
//             ]
//         }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.updateComponentAsync(entity, component).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(false);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher:  Error out with promise when invoking updateComponentAsync."] = function () {
//     var entity = {
//         _id: 1
//     };

//     var component = {
//         _id: 1,
//         type: "test",
//         entity_id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionErrorToThrow: "ERROR" }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.updateComponentAsync(entity, component).then(() => {
//         invokeAssert(() => {
//             assert.ok(false);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     });
// };