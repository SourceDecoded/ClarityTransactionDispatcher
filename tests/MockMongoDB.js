var assert = require("assert");
var MockMongo = require("./../mock/Mongo").default;

exports["Mongo: Successfully invoking MongoClient.connect."] = function () {
    var mongo = new MockMongo({ responses: [{}] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            assert.ok(true);
        }
    });
};

exports["Mongo: Error out with callback when invoking MongoClient.connect."] = function () {
    var mongo = new MockMongo({ responses: [{ connectErrorToThrow: "ERROR" }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.ok(error);
        } else {
            assert.fail();
        }
    });
};

exports["Mongo: Successfully invoking db.collection."] = function () {
    var mongo = new MockMongo({ responses: [{}] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    assert.ok(true);
                }
            });
        }
    });
};

exports["Mongo: Error out with callback when invoking db.collection."] = function () {
    var mongo = new MockMongo({ responses: [{ collectionErrorToThrow: "ERROR" }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.ok(true);
                } else {
                    assert.fail();
                }
            });
        }
    });
};

exports["Mongo: Successfully invoking collection.insertOne."] = function () {
    var document = {
        _id: 1,
        name: "test"
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodResult: document }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.insertOne(document, function (error, result) {
                        if (error) {
                            assert.fail(error);
                        } else {
                            assert.equal(document, result);
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Error out with callback when invoking collection.insertOne."] = function () {
    var document = {
        _id: 1,
        name: "test"
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodErrorToThrow: "ERROR" }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.insertOne(document, function (error, result) {
                        if (error) {
                            assert.ok(true);
                        } else {
                            assert.fail();
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Successfully invoking collection.deleteOne."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodResult: filter }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.deleteOne(filter, function (error, result) {
                        if (error) {
                            assert.fail(error);
                        } else {
                            assert.equal(filter, result);
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Error out with callback when invoking collection.deleteOne."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodErrorToThrow: "ERROR" }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.deleteOne(filter, function (error, result) {
                        if (error) {
                            assert.ok(true);
                        } else {
                            assert.fail();
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Successfully invoking collection.update."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodResult: filter }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.update(filter, function (error, result) {
                        if (error) {
                            assert.fail(error);
                        } else {
                            assert.equal(filter, result);
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Error out with callback when invoking collection.update."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodErrorToThrow: "ERROR" }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.update(filter, function (error, result) {
                        if (error) {
                            assert.ok(true);
                        } else {
                            assert.fail();
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Successfully invoking collection.find."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodResult: filter }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.find(filter, function (error, result) {
                        if (error) {
                            assert.fail(error);
                        } else {
                            assert.equal(filter, result);
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Error out with callback when invoking collection.find."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodErrorToThrow: "ERROR" }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.find(filter, function (error, result) {
                        if (error) {
                            assert.ok(true);
                        } else {
                            assert.fail();
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Successfully invoking collection.findOne."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodResult: filter }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.findOne(filter, function (error, result) {
                        if (error) {
                            assert.fail(error);
                        } else {
                            assert.equal(filter, result);
                        }
                    });
                }
            });
        }
    });
};

exports["Mongo: Error out with callback when invoking collection.findOne."] = function () {
    var filter = {
        _id: 1
    };
    var mongo = new MockMongo({ responses: [{ collectionMethodErrorToThrow: "ERROR" }] });
    var MongoClient = mongo.MongoClient;

    MongoClient.connect("", function (error, db) {
        if (error) {
            assert.fail(error);
        } else {
            db.collection("test", function (error, collection) {
                if (error) {
                    assert.fail(error);
                } else {
                    collection.findOne(filter, function (error, result) {
                        if (error) {
                            assert.ok(true);
                        } else {
                            assert.fail();
                        }
                    });
                }
            });
        }
    });
};