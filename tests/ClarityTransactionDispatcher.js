var assert = require("assert");
var ClarityTransactionDispatcher = require("./../library/ClarityTransactionDispatcher").default;
var MockMongo = require("./../mock/Mongo").default;
var MongoFactory = require("./../mock/MongoFactory").default;

var invokeAssert = (callback) => {
    setTimeout(callback);
};

exports["ClarityTransactionDispatcher: Successfully invoking _addItemToCollectionAsync."] = () => {
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

exports["ClarityTransactionDispatcher: Successfully invoking _initializingSystemAsync."] = () => {
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

exports["ClarityTransactionDispatcher: Successfully create new systemData when invoking _initializingSystemAsync."] = () => {
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
        mongodbConfig: { responses: [{ collectionMethodResult: null }, { collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, { collectionMethodResult: { isInitialized: true, systemGuid: "*TEST*" } }] }
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
            assert.ok(error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call initializeAsync when invoking _initializingSystemAsync."] = () => {
    var initializeAsyncCalled = false;

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
            initializeAsyncCalled = true;
        }
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
            assert.equal(initializeAsyncCalled, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

// exports["ClarityTransactionDispatcher: Successfully invoking addEntityAsync."] = () => {
//     var entity = {
//         _id: 1
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionMethodResult: entity }] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addEntityAsync(entity).then(() => {
//         invokeAssert(() => {
//             assert.ok(true);
//         });
//     }).catch((error) => {
//         invokeAssert(() => {
//             assert.ok(false);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Error out with validating addEntityAsync."] = () => {
//     var entity = {
//         _id: 1
//     };

//     var expectedError = "Error: validation of entity."

//     var system = {
//         guid: "*TEST*",
//         name: "Test",
//         getGuid: () => {
//             return system.guid;
//         },
//         getName: () => {
//             return system.name;
//         },
//         validateEntityAsync: () => {
//             return Promise.reject(new Error(expectedError));
//         }
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, {}] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addSystemAsync(system).then(() => {
//         return dispatcher.addEntityAsync(entity);
//     }).then(() => {
//         assert.ok(false);
//     }).catch(error => {
//         invokeAssert(() => {
//             assert.equal(expectedError, error.message);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully call entityAddedAsync on systems after addEntityAsync."] = () => {
//     var entity = {
//         _id: 1
//     };

//     var entityAddedAsyncCalled = false;

//     var system = {
//         guid: "*TEST*",
//         name: "Test",
//         getGuid: () => {
//             return system.guid;
//         },
//         getName: () => {
//             return system.name;
//         },
//         entityAddedAsync: () => {
//             entityAddedAsyncCalled = true;
//         }
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: { responses: [{ collectionMethodResult: { isInitialized: false, systemGuid: "*TEST*" } }, { collectionMethodResult: entity }, {}] }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addSystemAsync(system).then(() => {
//         return dispatcher.addEntityAsync(entity);
//     }).then(() => {
//         assert.equal(entityAddedAsyncCalled, true);
//     }).catch(error => {
//         invokeAssert(() => {
//             assert.ok(false);
//         });
//     });
// };

// exports["ClarityTransactionDispatcher: Successfully call entityAddedAsync on systems after error on first system addEntityAsync."] = () => {
//     var entity = {
//         _id: 1
//     };

//     var entityAddedAsyncCalled = false;

//     var system1 = {
//         guid: "*TEST1*",
//         name: "Test1",
//         getGuid: () => {
//             return system1.guid;
//         },
//         getName: () => {
//             return system1.name;
//         },
//         entityAddedAsync: () => {
//             return Promise.reject(new Error("ERROR"));
//         }
//     };

//     var system2 = {
//         guid: "*TEST2*",
//         name: "Test2",
//         getGuid: () => {
//             return system2.guid;
//         },
//         getName: () => {
//             return system2.name;
//         },
//         entityAddedAsync: () => {
//             entityAddedAsyncCalled = true;
//         }
//     };

//     var mongoFactory = new MongoFactory({
//         gridFsConfig: { responses: [] },
//         mongodbConfig: {
//             responses: [
//                 { collectionMethodResult: { isInitialized: false, systemGuid: "*TEST1*" } },
//                 { collectionMethodResult: { isInitialized: false, systemGuid: "*TEST2*" } },
//                 { collectionMethodResult: entity },
//                 {},
//                 {}
//             ]
//         }
//     });

//     var dispatcher = new ClarityTransactionDispatcher({
//         mongoFactory: mongoFactory,
//         databaseUrl: ""
//     });

//     dispatcher.addSystemAsync(system1).then(() => {
//         return dispatcher.addSystemAsync(system2);
//     }).then(() => {
//         return dispatcher.addEntityAsync(entity);
//     }).then(() => {
//         assert.equal(entityAddedAsyncCalled, true);
//     }).catch(error => {
//         invokeAssert(() => {
//             assert.ok(false);
//         });
//     });
// };

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
            return system.guid;
        },
        getName: () => {
            return system.name;
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
            return system.guid;
        },
        getName: () => {
            return system.name;
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
            return system1.guid;
        },
        getName: () => {
            return system1.name;
        },
        entityComponentAddedAsync: () => {
            return Promise.reject(new Error("ERROR"));
        }
    };

    var system2 = {
        guid: "*TEST2*",
        name: "Test2",
        getGuid: () => {
            return system2.guid;
        },
        getName: () => {
            return system2.name;
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

exports["ClarityTransactionDispatcher: Successfully invoking addSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        activatedAsync: () => {
            return;
        }
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
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
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
            return system.guid;
        },
        getName: () => {
            return system.name;
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

exports["ClarityTransactionDispatcher: Error out with promise when calling activatedAsync on system after invoking addSystemAsync."] = () => {
    var expectedError = "Error: activatedAsync."

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        activatedAsync: () => {
            return Promise.reject(new Error(expectedError));
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
            assert.equal(expectedError, error.message);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking deactivateSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        }
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
        return dispatcher.deactivateSystemAsync(system);
    }).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call deactivatedAsync when invoking deactivateSystemAsync."] = () => {
    var deactivatedAsyncCalled = false;

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        deactivatedAsync: () => {
            deactivatedAsyncCalled = true;
        }
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
        return dispatcher.deactivateSystemAsync(system);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(deactivatedAsyncCalled, true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully recover when deactivatedAsync errors on promise when invoking deactivateSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        deactivatedAsync: () => {
            return Promise.reject(new Error("ERROR"));
        }
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
        return dispatcher.deactivateSystemAsync(system);
    }).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out if system does not exist when invoking deactivateSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        }
    };

    var activatedAsyncCalled = false;

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.deactivateSystemAsync(system).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking disposeSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        }
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
        return dispatcher.disposeSystemAsync(system);
    }).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call disposeAsync when invoking disposeSystemAsync."] = () => {
    var disposeAsyncCalled = false;

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        disposeAsync: () => {
            disposeAsyncCalled = true;
        }
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
        return dispatcher.disposeSystemAsync(system);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(disposeAsyncCalled, true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully recover when disposeAsync errors on promise when invoking disposeSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        disposeAsync: () => {
            return Promise.reject(new Error("ERROR"));
        }
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
        return dispatcher.disposeSystemAsync(system);
    }).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out if system does not exist when invoking disposeSystemAsync."] = () => {
    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        }
    };

    var activatedAsyncCalled = false;

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.disposeSystemAsync(system).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentAsync."] = () => {
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

    dispatcher.getComponentByIdAsync(component._id).then((result) => {
        invokeAssert(() => {
            assert.deepEqual(component, result);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.fail(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentAsync."] = () => {
    var component = {
        _id: 1,
        type: "Test"
    };

    var expectedError = "Error: Promise rejected when invoking getComponentAsync."

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodErrorToThrow: expectedError }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.getComponentByIdAsync(component._id).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: components }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAsync(entity).then((result) => {
        invokeAssert(() => {
            assert.deepEqual(components, result);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var expectedError = "Error: Promise rejected when invoking getComponentsByEntityAsync"

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodErrorToThrow: expectedError }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAsync(entity).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getComponentsByEntityAndTypeAsync."] = () => {
    var entity = {
        _id: 1
    };

    var components = [{ _id: 1, entity_id: 1, type: "test" }, { _id: 2, entity_id: 1, type: "test" }, { _id: 3, entity_id: 1, type: "test" }];

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: components }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then((result) => {
        invokeAssert(() => {
            assert.deepEqual(components, result);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getComponentsByEntityAndTypeAsync."] = () => {
    var entity = {
        _id: 1
    };

    var expectedError = "Error: Promise rejected when invoking getComponentsByEntityAndTypeAsync"

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodErrorToThrow: expectedError }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.getComponentsByEntityAndTypeAsync(entity, "test").then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getEntityByIdAsync."] = () => {
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

    dispatcher.getEntityByIdAsync(entity._id).then((result) => {
        invokeAssert(() => {
            assert.deepEqual(entity, result);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking getEntityByIdAsync."] = () => {
    var entity = {
        _id: 1
    };

    var expectedError = "Error: Promise rejected when invoking getEntityByIdAsync"

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodErrorToThrow: expectedError }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.getEntityByIdAsync(entity._id).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking getEntitiesIterator."] = () => {
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
            assert.ok(false);
        });
    }
};

exports["ClarityTransactionDispatcher: Successfully invoking getService."] = () => {
    var service = {
        name: "test"
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addServiceAsync(service.name, service).then(() => {
        return dispatcher.getService("test");
    }).then((result) => {
        invokeAssert(() => {
            assert.deepEqual(service, result);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking removeComponentAsync."] = () => {
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
        mongodbConfig: { responses: [{ collectionMethodResult: component }, { collectionMethodResult: entity }] }
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
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityComponentRemovedAsync when invoking removeComponentAsync."] = () => {
    var entityComponentRemovedAsyncCalled = false;

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        entityComponentRemovedAsync: () => {
            entityComponentRemovedAsyncCalled = true;
        }
    };

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
        mongodbConfig: { responses: [{ collectionMethodResult: system }, {}, { collectionMethodResult: component }, { collectionMethodResult: entity }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.removeComponentAsync(component);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(entityComponentRemovedAsyncCalled, true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityComponentRemovedAsync on systems after error on first system when invoking removeComponentAsync."] = () => {
    var entityComponentRemovedAsyncCalled = false;

    var system1 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system1.guid;
        },
        getName: () => {
            return system1.name;
        },
        entityComponentRemovedAsync: () => {
            return Promise.reject(new Error("ERROR"));
        }
    };

    var system2 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system2.guid;
        },
        getName: () => {
            return system2.name;
        },
        entityComponentRemovedAsync: () => {
            entityComponentRemovedAsyncCalled = true;
        }
    };

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
        mongodbConfig: { responses: [{ collectionMethodResult: system1 }, {}, { collectionMethodResult: system2 }, {}, { collectionMethodResult: component }, { collectionMethodResult: entity }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system1).then(() => {
        return dispatcher.addSystemAsync(system2);
    }).then(() => {
        return dispatcher.removeComponentAsync(component);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(entityComponentRemovedAsyncCalled, true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking removeComponentAsync."] = () => {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var expectedError = "Error: Promise rejected when invoking removeComponentAsync"

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: component }, { collectionMethodErrorToThrow: expectedError }] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.removeComponentAsync(component).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
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
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call serviceRemovedAsync when invoking removeServiceAsync."] = () => {
    var serviceRemovedAsyncCalled = false;

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        serviceRemovedAsync: () => {
            serviceRemovedAsyncCalled = true;
        }
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
        return dispatcher.addServiceAsync("test", {});
    }).then(() => {
        return dispatcher.removeServiceAsync("test");
    }).then(() => {
        invokeAssert(() => {
            assert.equal(serviceRemovedAsyncCalled, true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call serviceRemovedAsync on systems after error on first system when invoking removeServiceAsync."] = () => {
    var serviceRemovedAsyncCalled = false;

    var system1 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system1.guid;
        },
        getName: () => {
            return system1.name;
        },
        serviceRemovedAsync: () => {
            return Promise.reject(new Error("ERROR"))
        }
    };

    var system2 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system2.guid;
        },
        getName: () => {
            return system2.name;
        },
        serviceRemovedAsync: () => {
            serviceRemovedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [{ collectionMethodResult: system1 }, {}, { collectionMethodResult: system2 }, {}] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system1).then(() => {
        return dispatcher.addSystemAsync(system2);
    }).then(() => {
        return dispatcher.addServiceAsync("test", {});
    }).then(() => {
        return dispatcher.removeServiceAsync("test");
    }).then(() => {
        invokeAssert(() => {
            assert.equal(serviceRemovedAsyncCalled, true);
        });
    }).catch(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out when service does not exist when invoking removeServiceAsync."] = () => {
    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: { responses: [] }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.removeServiceAsync("test").then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking updateEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [{ collectionMethodResult: entity }, { collectionMethodResult: entity }]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.updateEntityAsync(entity).then(() => {
        invokeAssert(() => {
            assert.ok(true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityUpdatedAsync on systems after invoking updateEntityAsync."] = () => {
    var entityUpdatedAsyncCalled = false;

    var entity = {
        _id: 1
    };

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        entityUpdatedAsync: () => {
            entityUpdatedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [{ collectionMethodResult: system }, {}, { collectionMethodResult: entity }, { collectionMethodResult: entity }]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.updateEntityAsync(entity);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(entityUpdatedAsyncCalled, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call entityUpdatedAsync on systems after error on first system when invoking updateEntityAsync."] = () => {
    var entityUpdatedAsyncCalled = false;

    var entity = {
        _id: 1
    };

    var system1 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system1.guid;
        },
        getName: () => {
            return system1.name;
        },
        entityUpdatedAsync: () => {
            return Promise.reject(new Promise("ERROR"));
        }
    };

    var system2 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system2.guid;
        },
        getName: () => {
            return system2.name;
        },
        entityUpdatedAsync: () => {
            entityUpdatedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [{ collectionMethodResult: system1 }, {}, { collectionMethodResult: system2 }, {}, { collectionMethodResult: entity }, { collectionMethodResult: entity }]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system1).then(() => {
        return dispatcher.addSystemAsync(system2);
    }).then(() => {
        return dispatcher.updateEntityAsync(entity);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(entityUpdatedAsyncCalled, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking updateEntityAsync."] = () => {
    var entity = {
        _id: 1
    };

    var expectedError = "Error: Promise rejected when invoking updateEntityAsync"

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [{ collectionMethodResult: entity }, { collectionErrorToThrow: expectedError }]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.updateEntityAsync(entity).then(() => {
        invokeAssert(() => {
            assert.ok(false);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.equal(expectedError, error);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully invoking updateComponentAsync."] = () => {
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
            responses: [{ collectionMethodResult: component }, { collectionMethodResult: component }]
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

exports["ClarityTransactionDispatcher: Successfully call componentUpdatedAsync on systems after invoking updateComponentAsync."] = () => {
    var componentUpdatedAsyncCalled = false;

    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var system = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system.guid;
        },
        getName: () => {
            return system.name;
        },
        componentUpdatedAsync: () => {
            componentUpdatedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [{ collectionMethodResult: system }, {}, { collectionMethodResult: component }, { collectionMethodResult: component }]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system).then(() => {
        return dispatcher.updateComponentAsync(entity, component);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(componentUpdatedAsyncCalled, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Successfully call componentUpdatedAsync on systems after error on first system when invoking updateComponentAsync."] = () => {
    var componentUpdatedAsyncCalled = false;

    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var system1 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system1.guid;
        },
        getName: () => {
            return system1.name;
        },
        componentUpdatedAsync: () => {
            return Promise.reject(new Promise("ERROR"));
        }
    };

    var system2 = {
        guid: "*TEST*",
        name: "Test",
        getGuid: () => {
            return system2.guid;
        },
        getName: () => {
            return system2.name;
        },
        componentUpdatedAsync: () => {
            componentUpdatedAsyncCalled = true;
        }
    };

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [{ collectionMethodResult: system1 }, {}, { collectionMethodResult: system2 }, {}, { collectionMethodResult: component }, { collectionMethodResult: component }]
        }
    });

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: ""
    });

    dispatcher.addSystemAsync(system1).then(() => {
        return dispatcher.addSystemAsync(system2);
    }).then(() => {
        return dispatcher.updateComponentAsync(entity, component);
    }).then(() => {
        invokeAssert(() => {
            assert.equal(componentUpdatedAsyncCalled, true);
        });
    }).catch((error) => {
        invokeAssert(() => {
            assert.ok(false);
        });
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking updateComponentAsync."] = () => {
    var entity = {
        _id: 1
    };

    var component = {
        _id: 1,
        type: "test",
        entity_id: 1
    };

    var expectedError = "Error: Promise rejected when invoking updateComponentAsync"

    var mongoFactory = new MongoFactory({
        gridFsConfig: { responses: [] },
        mongodbConfig: {
            responses: [{ collectionMethodResult: component }, { collectionErrorToThrow: expectedError }]
        }
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
            assert.equal(expectedError, error);
        });
    });
};