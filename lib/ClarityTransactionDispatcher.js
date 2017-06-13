"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var fs = _interopRequireWildcard(_fs);

var _nodeUuid = require("node-uuid");

var uuid = _interopRequireWildcard(_nodeUuid);

var _mongodbPrebuilt = require("mongodb-prebuilt");

var _mongodb = require("mongodb");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var resolvedPromise = Promise.resolve(null);

var ENTITIES_COLLECTION = "entities";
var SYSTEM_DATA_COLLECTION = "systemData";
var NOTICE = "notice";

var defaultMongodbConfig = {
    databaseName: "clarity_transaction_dispatcher",
    ip: "localhost",
    port: "27017",
    isBuiltIn: true,
    isInMemory: false
};

var defaultConfig = {
    mongodb: defaultMongodbConfig
};

/**
 * Class that organizes systems to respond to data transactions.
 * The dispatcher manages the life-cycle of data entities. They can be
 * added, updated, and removed. The dispatcher is not responsible
 * for anything beyond this. It will notify the systems when any entity 
 * has been added, updated, and removed. This allows the dispatcher 
 * to remain unopinionated about tasks to run when a certain entity is 
 * added, updated, or removed.
 * 
 * The idea behind the dispatcher is to handle the complexity of the IoT.
 * There are many systems, devices, and other technologies that need to 
 * communicate for a company to run smoothly. We believe that the answer to 
 * these needs is a data dispatcher which lets all independent systems know
 * about data changes.
 */

var ClarityTransactionDispatcher = function () {

    /**
     * Create a Dispatcher.
     * @constructor
     * @param {object} config - {mongodb:{databaseName:string; ip:string; port:string; isBuildIn:boolean; isInMemory:boolean;}}.
     */
    function ClarityTransactionDispatcher(config) {
        _classCallCheck(this, ClarityTransactionDispatcher);

        config = Object.assign({}, defaultConfig, config);
        this.mongodbConfig = Object.assign({}, defaultMongodbConfig, config.mongodb);

        this.systems = [];
        this.services = {};
        this.entityQueue = new Map();
        this.isInitialized = false;
        this.initializingPromise = null;
        this.mongoHelper = null;
        this.ObjectID = _mongodb.ObjectID;
    }

    /**
     * Add an item to a collection into mongodb.
     * @private 
     * @param {string} collectionName - The mongodb collection name.
     * @param {object} item - The item to be added.
     */


    _createClass(ClarityTransactionDispatcher, [{
        key: "_addItemToCollectionAsync",
        value: function _addItemToCollectionAsync(collectionName, item) {
            item.modifiedDate = new Date();
            item.createdDate = new Date();
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.insertOne(item);
            }).then(function (result) {
                item._id = result.insertedId;
                return item;
            });
        }

        /**
         * Ensures the mongodb is ready by asserting that it has been successfully started.
         */

    }, {
        key: "_assertIsStarted",
        value: function _assertIsStarted() {
            if (!this.isInitialized) {
                throw new Error("The dispatcher needs to be started before calling any other method.");
            }
        }

        /**
         * 
         * @param {IEntity} entity - The entity to manage component id's to. 
         */

    }, {
        key: "_assignObjectIdsToComponents",
        value: function _assignObjectIdsToComponents(entity) {
            var _this = this;

            entity.components.forEach(function (component) {
                if (!component._id) {
                    component._id = _this.ObjectID();
                } else {
                    component._id = _this.ObjectID(component._id);
                }
            });
        }

        /** 
         * Find one in a collection.
         * @private
         */

    }, {
        key: "_findOneAsync",
        value: function _findOneAsync(collectionName, filter) {
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.findOne(filter);
            });
        }

        /** 
        * Find many in a collection.
        * @private
        */

    }, {
        key: "_findAsync",
        value: function _findAsync(collectionName, filter, sort, pageSize) {
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
            });
        }

        /** 
         * Get count in a collection.
         * @private
         */

    }, {
        key: "_getCountAsync",
        value: function _getCountAsync(collectionName) {
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.count();
            });
        }

        /**
         * Get a mongodb.
         * @private
         * @returns {Promise<mongodb>}
         */

    }, {
        key: "_getDatabaseAsync",
        value: function _getDatabaseAsync() {
            var databaseName = this.mongodbConfig.isInMemory ? this.mongodbConfig.databaseName + "_in_memory" : this.mongodbConfig.databaseName;
            var databaseUrl = "mongodb://" + this.mongodbConfig.ip + ":" + this.mongodbConfig.port + "/" + databaseName;

            return _mongodb.MongoClient.connect(databaseUrl);
        }

        /**
         * Initialize a system.
         * @private
         */

    }, {
        key: "_initializingSystemAsync",
        value: function _initializingSystemAsync(system) {
            var _this2 = this;

            var systemGuid = system.getGuid();

            var filter = {
                systemGuid: systemGuid
            };

            return this._findOneAsync(SYSTEM_DATA_COLLECTION, filter).then(function (systemData) {
                if (systemData == null) {
                    var newSystemData = {
                        systemGuid: systemGuid,
                        isInitialized: false
                    };

                    return _this2._addItemToCollectionAsync(SYSTEM_DATA_COLLECTION, newSystemData);
                } else {
                    return systemData;
                }
            }).then(function (systemData) {
                if (!systemData.isInitialized) {
                    return _this2._invokeMethodAsync(system, "initializeAsync", [_this2]).then(function () {
                        systemData.isInitialized = true;
                        return _this2._updateItemInCollectionAsync(SYSTEM_DATA_COLLECTION, systemData);
                    });
                }
            }).catch(function (error) {
                _this2.logError({ message: error.message });
                throw error;
            });
        }

        /**
         * Invoke a method on any object and make sure a promise is the returned value.
         * @private
         */

    }, {
        key: "_invokeMethodAsync",
        value: function _invokeMethodAsync(obj, methodName, args) {
            var returnValue;

            if (typeof obj[methodName] === "function") {
                returnValue = obj[methodName].apply(obj, args);
                if (!(returnValue instanceof Promise)) {
                    returnValue = Promise.resolve(returnValue);
                }
            } else {
                returnValue = resolvedPromise;
            }

            return returnValue;
        }

        /**
         * Notify the systems of a life cycle by its method name.
         * @private
         * @returns {Promise<undefined>}
         */

    }, {
        key: "_notifySystemsAsync",
        value: function _notifySystemsAsync(methodName, args) {
            var _this3 = this;

            return this.systems.reduce(function (promise, system) {

                return promise.then(function () {

                    try {
                        return _this3._invokeMethodAsync(system, methodName, args);
                    } catch (error) {
                        _this3.logError(error);
                        throw error;
                    }
                });
            }, resolvedPromise);
        }

        /**
           * Notify the systems of a life cycle by its method name and recover if 
           * any of the systems reject the promise.
           * 
           * This will be used for most life-cycle calls. The other systems need to respond 
           * regardless of other systems failing.
           * @private
           * @returns {Promise<undefined>}
           */

    }, {
        key: "_notifySystemsWithRecoveryAsync",
        value: function _notifySystemsWithRecoveryAsync(methodName, args) {
            var _this4 = this;

            return this.systems.reduce(function (promise, system) {

                return promise.then(function () {

                    try {
                        return _this4._invokeMethodAsync(system, methodName, args);
                    } catch (error) {
                        _this4.logError(error);
                        throw error;
                    }
                }).catch(function () {
                    return resolvedPromise;
                });
            }, resolvedPromise);
        }

        /**
         * Remove an item from a collection.
         * @private
         * @returns {Promise<undefined>}
         */

    }, {
        key: "_removeItemfromCollection",
        value: function _removeItemfromCollection(collectionName, item) {
            var _this5 = this;

            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.deleteOne({
                    _id: _this5.ObjectID(item._id)
                });
            });
        }

        /**
         * Update an item in a collection.
         * @private
         * @returns {Promise<undefined>}
         */

    }, {
        key: "_updateItemInCollectionAsync",
        value: function _updateItemInCollectionAsync(collectionName, item) {
            var _this6 = this;

            item.modifiedDate = new Date();
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.update({
                    _id: _this6.ObjectID(item._id)
                }, item, null);
            });
        }

        /**
         * Add an Entity to the datastore. The steps the dispatcher takes when saving an
         * entity are.
         * 
         * - Have the Systems prepare the entity to be inserted with prepareEntityToBeAddedAsync.
         * - Validate the entity with all systems. All systems have to validate to pass.
         * - Save the entity to the datastore.
         * - Notify the systems that an entity has been added with entityAddedAsync.
         * @param {IEntity} entity - The entity that you want to save to the datastore.
         * @return {Promise<Entity>}
         */

    }, {
        key: "addEntityAsync",
        value: function addEntityAsync(entity) {
            var _this7 = this;

            this._assertIsStarted();

            var newEntity = {
                _id: entity._id ? this.ObjectID(entity._id) : this.ObjectID(),
                revision: this.ObjectID(),
                components: Array.isArray(entity.components) ? entity.components : []
            };

            this._assignObjectIdsToComponents(newEntity);

            return this._notifySystemsWithRecoveryAsync("prepareEntityToBeAddedAsync", [newEntity]).then(function () {
                _this7.validateEntityAsync(newEntity);
            }).then(function () {
                return _this7._addItemToCollectionAsync(ENTITIES_COLLECTION, newEntity);
            }).then(function (entity) {
                return _this7._notifySystemsWithRecoveryAsync("entityAddedAsync", [Object.freeze(entity)]).then(function () {
                    return entity;
                });
            }).catch(function (error) {
                _this7.logError(error);
                throw error;
            });
        }

        /**
         * Add a service for systems to use. Services could be HTTP services,
         * or governance that needs to be shared acrossed systems.
         * @param {string} name - The name by which the systems will request the service.
         * @param {object} service - The service.
         * @return {Promise<undefined>}
         */

    }, {
        key: "addServiceAsync",
        value: function addServiceAsync(name, service) {
            this._assertIsStarted();

            this.services[name] = service;
            return resolvedPromise;
        }

        /**
         * Add a system to the dispatcher. The systems are really where the work 
         * is done. They listen to the life-cycle of the entity and react based
         * on the composition of components.
         * The dispatcher does the following when adding a system.
         * 
         * - Adds the system.
         * - Invokes initializeAsync if the system hasn't been initialized before.
         * - Invokes activatedAsync after initializeAsync is finished.
         * 
         * #### Required System Methods
         * - getGuid()
         * - getName()
         * 
         * #### Optional System Methods
         *  - activatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
         *  - approveEntityRemovalAsync(entity: IEntity)
         *  - deactivatedAsync()
         *  - disposedAsync()
         *  - entityAddedAsync(entity: IEntity)
         *  - entityRemovedAsync(entity: IEntity)
         *  - entityRetrievedAsync(entity: IEntity)
         *  - entityUpdatedAsync(oldEntity: IEntity, updatedEntity: IEntity)
         *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
         *  - logError(error: { type?: string; message?: string; })
         *  - logMessage(message: { type?: string; message?: string; })
         *  - logWarning(warning: { type?: string; message?: string; })
         *  - prepareEntityToBeAddedAsync(enitty: IEntity)
         *  - prepareEntityToBeUpdatedAsync(oldEntity: IEntity, entity: IEntity)
         *  - serviceRemovedAsync(name: string)
         *  - validateEntityAsync(entity: IEntity)
         * @param {ISystem} system - The system to add.
         * @return {Promise} - An undefined Promise.
         */

    }, {
        key: "addSystemAsync",
        value: function addSystemAsync(system) {
            var _this8 = this;

            this._assertIsStarted();

            if (!this.validateSystem(system)) {
                return Promise.reject(new Error("Invalid system: Systems need to have a getName and a getGuid method on them."));
            } else {
                this.systems.push(system);
                return this._initializingSystemAsync(system).then(function () {
                    _this8.logMessage({
                        type: NOTICE,
                        message: "System \"" + system.getName() + "\" was initialized."
                    });

                    return _this8._invokeMethodAsync(system, "activatedAsync", [_this8]);
                }).then(function () {
                    _this8.logMessage({
                        type: NOTICE,
                        message: "System \"" + system.getName() + "\" was activated."
                    });
                }).catch(function (error) {
                    _this8.logError(error);
                    throw error;
                });
            }
        }

        /**
        * Approves whether an entity can be removed. Systems can deny the ability to remove entities.
        * @param entity {object} - The entity to be removed.
        */

    }, {
        key: "approveEntityRemovalAsync",
        value: function approveEntityRemovalAsync(entity) {
            this._assertIsStarted();

            return this._notifySystemsAsync("approveEntityRemovalAsync", [entity]);
        }

        /**
         * Deactivates a system and removes it from the systems being notified. To activate again use addSystemAsync.
         * Think of this like a pause. The dispatcher calls deactivatedAsync on the system being removed.
         * @param {ISystem} system - The system to be deactivate.
         * @returns {Promise<undefined>} - Resolves when the system is deactivated.
         */

    }, {
        key: "deactivateSystemAsync",
        value: function deactivateSystemAsync(system) {
            var _this9 = this;

            this._assertIsStarted();

            var deactivatedPromise = void 0;
            var index = this.systems.indexOf(system);

            if (index === -1) {
                return Promise.reject(new Error("Couldn't find system to be deactivated."));
            } else {

                this.systems.splice(index, 1);

                try {
                    return deactivatedPromise = this._invokeMethodAsync(system, "deactivatedAsync", []).then(function () {
                        _this9.logMessage({
                            type: NOTICE,
                            message: "System \"" + system.getName() + "\" was deactivated."
                        });
                    }).catch(function () {
                        return resolvedPromise;
                    });
                } catch (error) {
                    return resolvedPromise;
                }
            }
        }

        /**
         * Disposes a system and removes it from the systems being notified. Use when removing systems for
         * good. This allows the system to clean up after itself if needed. The dispatcher calls disposeAsync on the system being removed.
         * @param {ISystem} system - The system to be disposed.
         * @returns {Promise<undefined>} - Resolves when the system is disposed.
         */

    }, {
        key: "disposeSystemAsync",
        value: function disposeSystemAsync(system) {
            var _this10 = this;

            this._assertIsStarted();

            var disposedPromise;
            var index = this.systems.indexOf(system);

            if (index === -1) {
                return Promise.reject(new Error("Couldn't find system to be disposed."));
            } else {

                this.systems.splice(index, 1);

                try {
                    return disposedPromise = this._invokeMethodAsync(system, "disposedAsync", []).then(function () {
                        _this10.logMessage({
                            type: NOTICE,
                            message: "System \"" + system.getName() + "\" was disposed."
                        });
                    }).catch(function () {
                        return resolvedPromise;
                    });
                } catch (error) {
                    return resolvedPromise;
                }
            }
        }

        /**
         * Page through entities using the lastId from a previous query. Use null or undefined to begin at the beginning.
         * @param config {} - The configuration of the query. It takes a lastId, pageSize, lastModifiedDate, and a lastCreatedDate. 
         */

    }, {
        key: "getEntitiesAsync",
        value: function getEntitiesAsync(config) {
            var _this11 = this;

            this._assertIsStarted();

            var lastId = config.lastId ? this.ObjectID(config.lastId) : null;
            var pageSize = config.pageSize < 50 ? config.pageSize : 50;
            var lastModifiedDate = config.lastModifiedDate;
            var lastCreatedDate = config.lastCreatedDate;

            var sort = [["_id", 1]];
            var filter = {};

            if (lastId != null) {
                filter._id = {
                    $gt: lastId
                };
            }

            if (lastCreatedDate != null) {
                filter.createdDate = {
                    $gt: lastCreatedDate
                };
                sort.push(["createdDate", 1]);
            }

            if (lastModifiedDate != null) {
                filter.modifiedDate = {
                    $gt: lastModifiedDate
                };
                sort.push(["modifiedDate", 1]);
            }

            return this._findAsync(ENTITIES_COLLECTION, filter, sort, pageSize).then(function (entities) {
                var notifySystemsPromises = entities.map(function (entity) {
                    return _this11._notifySystemsWithRecoveryAsync("entityRetrievedAsync", [entity]);
                });

                return Promise.all(notifySystemsPromises).then(function () {
                    return entities;
                });
            }).catch(function (error) {
                _this11.logError(error);
                throw error;
            });
        }

        /**
         * Get an entity by its id.
         * @param {string} entityId - The id of the desired entity.
         * @return {Promise<Entity>} - A Promise resolved with the entity or null.
         */

    }, {
        key: "getEntityByIdAsync",
        value: function getEntityByIdAsync(entityId) {
            var _this12 = this;

            this._assertIsStarted();

            return this._findOneAsync(ENTITIES_COLLECTION, {
                _id: this.ObjectID(entityId)
            }).then(function (entity) {
                return _this12._notifySystemsWithRecoveryAsync("entityRetrievedAsync", [entity]).then(function () {
                    return entity;
                });
            }).catch(function (error) {
                _this12.logError(error);
                throw error;
            });
        }

        /**
         * Get count for all entities in collection.
         */

    }, {
        key: "getEntityCountAsync",
        value: function getEntityCountAsync() {
            this._assertIsStarted();

            return this._getCountAsync(ENTITIES_COLLECTION);
        }

        /**
         * Get a service by the name given.
         * @param {string} name - The name of the desired service.
         * @returns {object} - Null or the desired service.
         */

    }, {
        key: "getService",
        value: function getService(name) {
            this._assertIsStarted();

            return this.services[name] || null;
        }

        /**
         * Get all systems.
         * @returns {Array<ISystems>}
         */

    }, {
        key: "getSystems",
        value: function getSystems() {
            this._assertIsStarted();

            return this.systems;
        }

        /**
         * Notifies the systems about an error.
         * @param error {object} - The error to be sent to the systems.
         * @returns {undefined}
         */

    }, {
        key: "logError",
        value: function logError(error) {
            this._assertIsStarted();

            this._notifySystemsAsync("logError", [error]);
        }

        /**
         * Notifies the systems about a message.
         * @param message {object} - The message to be sent to the systems.
         * @returns {undefined}
         */

    }, {
        key: "logMessage",
        value: function logMessage(message) {
            this._assertIsStarted();

            this._notifySystemsAsync("logMessage", [message]);
        }

        /**
         * Notifies the systems about a warning.
         * @param warning {object} - The warning to be sent to the systems.
         * @returns {undefined}
         */

    }, {
        key: "logWarning",
        value: function logWarning(warning) {
            this._assertIsStarted();

            this._notifySystemsAsync("logWarning", [warning]);
        }

        /**
         * Removes the entity to be removed and notifies the systems the entity has been removed.
         * @param {IEntity} entity - The entity to be removed.
         * @returns {Promise<undefined>} 
         */

    }, {
        key: "removeEntityAsync",
        value: function removeEntityAsync(entity) {
            var _this13 = this;

            this._assertIsStarted();

            return this._removeItemfromCollection(ENTITIES_COLLECTION, entity).then(function () {
                return _this13._notifySystemsWithRecoveryAsync("entityRemovedAsync", [Object.freeze(entity)]);
            }).then(function () {
                return entity;
            }).catch(function (error) {
                _this13.logError(error);
                throw error;
            });
        }

        /**
         * Removes a service by its name. The dispatcher will notify the systems that this service is being 
         * removed.
         * @param {string} name - The name of the service to be removed.
         * @returns {undefined}
         */

    }, {
        key: "removeServiceAsync",
        value: function removeServiceAsync(name) {
            this._assertIsStarted();

            if (this.services[name]) {
                delete this.services[name];
                return this._notifySystemsWithRecoveryAsync("serviceRemovedAsync", [name]);
            } else {
                var error = Error("Couldn't find service to be removed.");
                this.logError(error);
                return Promise.reject(error);
            }
        }

        /**
         * Starts the database.
         */

    }, {
        key: "startAsync",
        value: function startAsync() {
            var _this14 = this;

            if (this.initializingPromise != null) {
                return this.initializingPromise;
            } else {
                this.mongoHelper = new _mongodbPrebuilt.MongodHelper(["--port", this.mongodbConfig.port, "--dbpath", "/data/db"]);

                return this.initializingPromise = this.mongoHelper.run().then(function () {
                    _this14.isInitialized = true;
                }).catch(function (error) {});
            }
        }

        /**
         * Stops the database. This will deactivate all the systems so they know that they are about 
         * to be turned off. This will allow the systems to turn off processes gracefully that they 
         * manage.
         */

    }, {
        key: "stopAsync",
        value: function stopAsync() {
            var _this15 = this;

            var initializingPromise = this.initializingPromise;

            if (this.initializingPromise == null) {
                initializingPromise = resolvedPromise;
            }

            return initializingPromise.then(function () {
                return _this15._notifySystemsWithRecoveryAsync("deactivatedAsync", []);
            }).then(function () {
                _this15.mongoHelper.mongoBin.childProcess.kill();
            });
        }

        /**
         * Update an entity. The dispatcher will perform the following actions when updating.
         * 
         * - Validate the entity. All interested systems need to validate to pass.
         * - Entity's updates are saved.
         * - The systems are notified about the update.
         * @param {object} entity - The updated entity.
         * @returns {Promise<undefined>} - Resolves when the entity is saved.
         */

    }, {
        key: "updateEntityAsync",
        value: function updateEntityAsync(entity) {
            var _this16 = this;

            var updatedEntity = {
                _id: entity._id ? this.ObjectID(entity._id) : this.ObjectID,
                revision: this.ObjectID(entity.revision),
                components: Array.isArray(entity.components) ? entity.components : []
            };

            this._assignObjectIdsToComponents(updatedEntity);

            return this._findOneAsync(ENTITIES_COLLECTION, {
                _id: updatedEntity._id
            }).then(function (oldEntity) {
                return _this16._notifySystemsWithRecoveryAsync("prepareEntityToBeUpdatedAsync", [oldEntity, updatedEntity]).then(function () {
                    return _this16.validateEntityAsync(updatedEntity);
                }).then(function () {
                    return oldEntity;
                });
            }).then(function (oldEntity) {

                if (oldEntity.revision.toString() !== updatedEntity.revision.toString()) {
                    var error = new Error("Entity out of date.");
                    error.name = "OutOfDate";
                    error.currentRevision = oldEntity;

                    throw error;
                }

                updatedEntity._id = oldEntity._id;
                updatedEntity.revision = _this16.ObjectID();
                updatedEntity.createdDate = oldEntity.createdDate;

                return _this16._updateItemInCollectionAsync(ENTITIES_COLLECTION, updatedEntity).then(function (oldEntity) {
                    return _this16._notifySystemsWithRecoveryAsync("entityUpdatedAsync", [oldEntity, Object.freeze(updatedEntity)]);
                }).then(function () {
                    return updatedEntity;
                });
            }).catch(function (error) {
                _this16.logError(error);
                throw error;
            });
        }

        /**
         * This allows systems to validate the entity being saved.
         */

    }, {
        key: "validateEntityAsync",
        value: function validateEntityAsync(entity) {
            return this._notifySystemsAsync("validateEntityAsync", [entity]);
        }

        /**
         * Ensures the system has the required methods.
         * @param {ISystem} system - The System to be validated.
         */

    }, {
        key: "validateSystem",
        value: function validateSystem(system) {
            if (typeof system.getGuid !== "function" || typeof system.getName !== "function") {
                return false;
            }

            return true;
        }
    }]);

    return ClarityTransactionDispatcher;
}();

exports.default = ClarityTransactionDispatcher;
//# sourceMappingURL=ClarityTransactionDispatcher.js.map