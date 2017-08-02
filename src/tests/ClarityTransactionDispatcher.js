import assert from "assert";
import * as clarityPackage from "./../index";

const ClarityTransactionDispatcher = clarityPackage.ClarityTransactionDispatcher;
const MongoDb = clarityPackage.MongoDb;

const DATABASE_NAME = "clarity_transaction_dispatcher";

var mongoDb = null;

exports.clean = function () {
    return mongoDb.getDatabaseAsync(DATABASE_NAME).then((db) => {
        return Promise.all([
            db.collection("entities").remove({}),
            db.collection("systemData").remove({})
        ]);
    });
};

exports.prepare = function () {
    mongoDb = new MongoDb();
};

exports.destroy = function () {
    return mongoDb.getDatabaseAsync(DATABASE_NAME).then(() => {
        return new Promise((resolve, reject) => {
            db.dropDatabase((error, result) => {
                if (error != null) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    });
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
        if (mongoDb.process.connections === 0) {
            assert.equal(mongoDb.isInitialized, false);
        } else {
            assert.equal(mongoDb.isInitialized, true);
        }
    });
};

exports["ClarityTransactionDispatcher.addEntityAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var calledPrepare = false;
    var calledValidate = false;

    var system = {
        prepareEntityToBeAddedAsync: (entity) => {
            calledPrepare = true;
            return Promise.resolve();
        },
        validateEntityToBeAddedAsync: (entity) => {
            calledValidate = true;
            return Promise.resolve();
        },
        getName: () => {
            return "Test";
        },
        getGuid: () => {
            return "Test";
        }
    };

    var collection = null;

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.addEntityAsync({ components: [{ type: "test" }] });
    }).then(() => {
        return mongoDb.getDatabaseAsync(DATABASE_NAME);
    }).then((db) => {
        collection = db.collection("entities");
        return collection.find().toArray();
    }).then((results) => {
        assert.equal(results.length, 1);
        assert.equal(calledValidate, true);
        assert.equal(calledPrepare, true);
    }).then(() => {
        return collection.remove({});
    });
};

exports["ClarityTransactionDispatcher.addServiceAsync without invoking startAsync."] = function () {
    assert.throws(() => {
        var dispatcher = new ClarityTransactionDispatcher(mongoDb);
        dispatcher.addServiceAsync({}).then(resolve).catch(reject);
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
        disposedAsync: () => {
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

    return dispatcher.startAsync().then(() => {
        return dispatcher.addServiceAsync("testService", service);
    }).then(() => {
        assert.equal(service, dispatcher.getService("testService"));
    });
};

exports["ClarityTransactionDispatcher.getSystems."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var system = {
        getGuid: () => { },
        getName: () => { }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        var systems = dispatcher.getSystems();

        assert.equal(systems.length, 1);
    });
};

exports["ClarityTransactionDispatcher.logErrorAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var hasLogged = false;
    var system = {
        getGuid: () => { },
        getName: () => { },
        logErrorAsync: () => {
            hasLogged = true;
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.logErrorAsync(new Error("Something bad happened."))
    }).then(() => {
        assert.equal(hasLogged, true);
    });
};

exports["ClarityTransactionDispatcher.logMessageAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var hasLogged = false;
    var logMessage = null;

    var system = {
        getGuid: () => { },
        getName: () => { },
        logMessageAsync: (message) => {
            logMessage = message;
            hasLogged = true;
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.logMessageAsync("Message");
    }).then(() => {
        assert.equal(logMessage, "Message");
        assert.equal(hasLogged, true);
    });
};

exports["ClarityTransactionDispatcher.logWarningAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var hasLogged = false;
    var logMessage = null;

    var system = {
        getGuid: () => { },
        getName: () => { },
        logWarningAsync: (message) => {
            logMessage = message;
            hasLogged = true;
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.logWarningAsync("Message");
    }).then(() => {
        assert.equal(logMessage, "Message");
        assert.equal(hasLogged, true);
    });
};

exports["ClarityTransactionDispatcher.removeEntityAsync: Approve removal."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var askedForApproval = false;

    var system = {
        getGuid: () => { },
        getName: () => { },
        approveEntityToBeRemovedAsync: (entity) => {
            askedForApproval = true;
            return Promise.resolve(null);
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.addEntityAsync({
            components: [
                {
                    type: "test"
                }
            ]
        });
    }).then((entity) => {
        return dispatcher.removeEntityAsync(entity);
    }).then(() => {
        return dispatcher.getEntitiesAsync();
    }).then((entities) => {
        assert.equal(entities.length, 0);
        assert.equal(askedForApproval, true);
    });
};

exports["ClarityTransactionDispatcher.removeEntityAsync: Reject removal."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var askedForApproval = false;
    var threw = false;

    var system = {
        getGuid: () => { },
        getName: () => { },
        approveEntityToBeRemovedAsync: (entity) => {
            askedForApproval = true;
            return Promise.reject(null);
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.addEntityAsync({
            components: [
                {
                    type: "test"
                }
            ]
        });
    }).then((entity) => {
        return dispatcher.removeEntityAsync(entity);
    }).catch(() => {
        threw = true;
    }).then(() => {
        return dispatcher.getEntitiesAsync();
    }).then((entities) => {
        assert.equal(entities.length, 1);
        assert.equal(askedForApproval, true);
        assert.equal(threw, true);
    });
};

exports["ClarityTransactionDispatcher.removeServiceAsync: Remove existing service."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var service = {};

    return dispatcher.startAsync().then(() => {
        return dispatcher.addServiceAsync("test", service);
    }).then(() => {
        assert.equal(dispatcher.getService("test"), service);
    }).then(() => {
        return dispatcher.removeServiceAsync("test");
    }).then(() => {
        assert.equal(dispatcher.getService("test"), null);
    });
};

exports["ClarityTransactionDispatcher.removeServiceAsync: Remove non-existing service, expect it to throw."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var service = {};

    return dispatcher.startAsync().then(() => {
        dispatcher.removeServiceAsync("test").then(() => {
            assert.fail(true);
        }).catch((error) => {
            assert.ok(true);
        });
    });
};

exports["ClarityTransactionDispatcher.stopAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var isDeactivated = false;

    var system = {
        deactivatedAsync: () => {
            isDeactivated = true;
        },
        getName: () => {
            return "Test";
        },
        getGuid: () => {
            return "Test";
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.stopAsync();
    }).then(() => {
        assert.equal(isDeactivated, true);
    });
};

exports["ClarityTransactionDispatcher.updateEntityAsync."] = function () {
    var dispatcher = new ClarityTransactionDispatcher(mongoDb);
    var calledPrepare = false;
    var calledValidate = false;

    var system = {
        prepareEntityToBeUpdatedAsync: (entity) => {
            calledPrepare = true;
            return Promise.resolve();
        },
        validateEntityToBeUpdatedAsync: (entity) => {
            calledValidate = true;
            return Promise.resolve();
        },
        getName: () => {
            return "Test";
        },
        getGuid: () => {
            return "Test";
        }
    };

    return dispatcher.startAsync().then(() => {
        return dispatcher.addSystemAsync(system);
    }).then(() => {
        return dispatcher.addEntityAsync({});
    }).then((entity) => {
        entity.components.push({
            type: "comp",
            prop: "foo"
        });
        return dispatcher.updateEntityAsync(entity);
    }).then(() => {
        assert.equal(calledValidate, true);
        assert.equal(calledPrepare, true);
    });
};
