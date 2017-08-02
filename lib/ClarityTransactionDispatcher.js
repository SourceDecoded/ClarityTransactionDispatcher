"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var fs = _interopRequireWildcard(_fs);

var _nodeUuid = require("node-uuid");

var uuid = _interopRequireWildcard(_nodeUuid);

var _Query = require("./Query");

var _Query2 = _interopRequireDefault(_Query);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var resolvedPromise = Promise.resolve(null);
var ENTITIES_COLLECTION = "entities";
var SYSTEM_DATA_COLLECTION = "systemData";
var NOTICE = "notice";
var DATABASE_URL = "clarity_transaction_dispatcher";
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
     */
    function ClarityTransactionDispatcher(mongoDb) {
        _classCallCheck(this, ClarityTransactionDispatcher);

        this.mongoDb = mongoDb;
        this.ObjectID = mongoDb.getObjectID();
        this.systems = [];
        this.services = {};
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
    }, {
        key: "_clone",
        value: function _clone(obj) {
            return JSON.parse(JSON.stringify(obj));
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
            return this.mongoDb.getDatabaseAsync(DATABASE_URL);
        }

        /**
         * Initialize a system.
         * @private
         */

    }, {
        key: "_initializingSystemAsync",
        value: function _initializingSystemAsync(system) {
            var _this = this;

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
                    return _this._addItemToCollectionAsync(SYSTEM_DATA_COLLECTION, newSystemData);
                } else {
                    return systemData;
                }
            }).then(function (systemData) {
                if (!systemData.isInitialized) {
                    return _this._invokeMethodAsync(system, "initializeAsync", [_this]).then(function () {
                        systemData.isInitialized = true;
                        return _this._updateItemInCollectionAsync(SYSTEM_DATA_COLLECTION, systemData);
                    });
                }
            }).catch(function (error) {
                _this.logErrorAsync({ message: error.message });
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
            var _this2 = this;

            return this.systems.reduce(function (promise, system) {
                return promise.then(function () {
                    try {
                        return _this2._invokeMethodAsync(system, methodName, args);
                    } catch (error) {
                        if (methodName !== "logErrorAsync") {
                            _this2.logErrorAsync(error);
                        }
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
            var _this3 = this;

            return this.systems.reduce(function (promise, system) {
                return promise.then(function () {
                    try {
                        return _this3._invokeMethodAsync(system, methodName, args);
                    } catch (error) {
                        _this3.logErrorAsync(error);
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
            var _this4 = this;

            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.deleteOne({
                    _id: _this4.ObjectID(item._id)
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
            var _this5 = this;

            item.modifiedDate = new Date();
            return this._getDatabaseAsync().then(function (db) {
                return db.collection(collectionName);
            }).then(function (collection) {
                return collection.update({
                    _id: _this5.ObjectID(item._id)
                }, item, null);
            });
        }

        /**
         * Add an Entity to the datastore. The steps the dispatcher takes when saving an
         * entity are.
         *
         * - Validate the entity with all systems. All systems have to validate to pass.
         * - Save the entity to the datastore.
         * - Notify the systems that an entity has been added.
         * @param {IEntity} entity - The entity that you want to save to the datastore.
         * @return {Promise<Entity>}
         */

    }, {
        key: "addEntityAsync",
        value: function addEntityAsync(entity) {
            var _this6 = this;

            var newEntity = {
                _id: entity._id ? this.ObjectID(entity._id) : this.ObjectID(),
                components: Array.isArray(entity.components) ? entity.components : []
            };

            newEntity.components.forEach(function (component) {
                if (!component._id) {
                    component._id = _this6.ObjectID();
                } else {
                    component._id = _this6.ObjectID(component._id);
                }
            });

            return this._notifySystemsWithRecoveryAsync("prepareEntityToBeAddedAsync", [newEntity]).then(function () {
                return _this6.validateEntityToBeAddedAsync(newEntity);
            }).then(function () {
                return _this6._addItemToCollectionAsync(ENTITIES_COLLECTION, newEntity);
            }).then(function (entity) {
                return _this6._notifySystemsWithRecoveryAsync("entityAddedAsync", [entity]).then(function () {
                    return entity;
                });
            }).catch(function (error) {
                _this6.logErrorAsync(error);
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
         *  - approveEntityToBeRemovedAsync(entity: IEntity)
         *  - deactivatedAsync()
         *  - disposedAsync()
         *  - entityAddedAsync(entity: IEntity)
         *  - entityRemovedAsync(entity: IEntity)
         *  - entityRetrievedAsync(entity: IEntity)
         *  - entityUpdatedAsync(oldEntity: IEntity, updatedEntity: IEntity)
         *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
         *  - logErrorAsync(error: { type?: string; message?: string; })
         *  - logMessageAsync(message: { type?: string; message?: string; })
         *  - logWarningAsync(warning: { type?: string; message?: string; })
         *  - prepareEntityToBeUpdatedAsync(oldEntity, entity)
         *  - prepareEntityToAddedAsync(entity)
         *  - serviceRemovedAsync(name: string)
         *  - validateEntityAsync(entity: IEntity)
         * @param {ISystem} system - The system to add.
         * @return {Promise} - An undefined Promise.
         */

    }, {
        key: "addSystemAsync",
        value: function addSystemAsync(system) {
            var _this7 = this;

            if (!this.validateSystem(system)) {
                return Promise.reject(new Error("Invalid system: Systems need to have a getName and a getGuid method on them."));
            } else {
                this.systems.push(system);
                return this._initializingSystemAsync(system).then(function () {
                    _this7.logMessageAsync({
                        type: NOTICE,
                        message: "System \"" + system.getName() + "\" was initialized."
                    });
                    return _this7._invokeMethodAsync(system, "activatedAsync", [_this7]);
                }).then(function () {
                    _this7.logMessageAsync({
                        type: NOTICE,
                        message: "System \"" + system.getName() + "\" was activated."
                    });
                }).catch(function (error) {
                    _this7.logErrorAsync(error);
                    throw error;
                });
            }
        }

        /**
        * Approves whether an entity can be removed. Systems can deny the ability to remove entities.
        * @param entity {object} - The entity to be removed.
        */

    }, {
        key: "approveEntityToBeRemovedAsync",
        value: function approveEntityToBeRemovedAsync(entity) {
            return this._notifySystemsAsync("approveEntityToBeRemovedAsync", [entity]);
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
            var _this8 = this;

            var deactivatedPromise = void 0;
            var index = this.systems.indexOf(system);
            if (index === -1) {
                return Promise.reject(new Error("Couldn't find system to be deactivated."));
            } else {
                this.systems.splice(index, 1);
                try {
                    return deactivatedPromise = this._invokeMethodAsync(system, "deactivatedAsync", []).then(function () {
                        _this8.logMessageAsync({
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
            var _this9 = this;

            var disposedPromise;
            var index = this.systems.indexOf(system);
            if (index === -1) {
                return Promise.reject(new Error("Couldn't find system to be disposed."));
            } else {
                this.systems.splice(index, 1);
                try {
                    return disposedPromise = this._invokeMethodAsync(system, "disposedAsync", []).then(function () {
                        _this9.logMessageAsync({
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
         * This allows you to define a query for entities, and then manages the iteration over the entities.
         */

    }, {
        key: "getQuery",
        value: function getQuery() {
            return new _Query2.default(this.mongoDb, ENTITIES_COLLECTION);
        }

        /**
         * Page through entities using the lastId from a previous query. Use null or undefined to begin at the beginning.
         * @param config {} - The configuration of the query. It takes a lastId, pageSize, lastModifiedDate, and a lastCreatedDate.
         */

    }, {
        key: "getEntitiesAsync",
        value: function getEntitiesAsync() {
            var _this10 = this;

            var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
                    return _this10._notifySystemsWithRecoveryAsync("entityRetrievedAsync", [entity]);
                });
                return Promise.all(notifySystemsPromises).then(function () {
                    return entities;
                });
            }).catch(function (error) {
                _this10.logErrorAsync(error);
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
            var _this11 = this;

            return this._findOneAsync(ENTITIES_COLLECTION, {
                _id: this.ObjectID(entityId)
            }).then(function (entity) {
                return _this11._notifySystemsWithRecoveryAsync("entityRetrievedAsync", [entity]).then(function () {
                    return entity;
                });
            }).catch(function (error) {
                _this11.logErrorAsync(error);
                throw error;
            });
        }

        /**
         * Get count for all entities in collection.
         */

    }, {
        key: "getEntityCountAsync",
        value: function getEntityCountAsync() {
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
            return this.services[name] || null;
        }
        /**
         * Get all systems.
         * @returns {Array<ISystems>}
         */

    }, {
        key: "getSystems",
        value: function getSystems() {
            return this.systems;
        }
        /**
         * Notifies the systems about an error.
         * @param error {object} - The error to be sent to the systems.
         * @returns {undefined}
         */

    }, {
        key: "logErrorAsync",
        value: function logErrorAsync(error) {
            this._notifySystemsAsync("logErrorAsync", [error]);
        }
        /**
         * Notifies the systems about a message.
         * @param message {object} - The message to be sent to the systems.
         * @returns {undefined}
         */

    }, {
        key: "logMessageAsync",
        value: function logMessageAsync(message) {
            this._notifySystemsAsync("logMessageAsync", [message]);
        }
        /**
         * Notifies the systems about a warning.
         * @param warning {object} - The warning to be sent to the systems.
         * @returns {undefined}
         */

    }, {
        key: "logWarningAsync",
        value: function logWarningAsync(warning) {
            this._notifySystemsAsync("logWarningAsync", [warning]);
        }
        /**
         * Removes the entity to be removed and notifies the systems the entity has been removed.
         * @param {IEntity} entity - The entity to be removed.
         * @returns {Promise<undefined>}
         */

    }, {
        key: "removeEntityAsync",
        value: function removeEntityAsync(entity) {
            var _this12 = this;

            return this.approveEntityToBeRemovedAsync(entity).then(function () {
                return _this12._removeItemfromCollection(ENTITIES_COLLECTION, entity);
            }).then(function () {
                return _this12._notifySystemsWithRecoveryAsync("entityRemovedAsync", [entity]);
            }).then(function () {
                return entity;
            }).catch(function (error) {
                _this12.logErrorAsync(error);
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
            if (this.services[name]) {
                delete this.services[name];
                return this._notifySystemsWithRecoveryAsync("serviceRemovedAsync", [name]);
            } else {
                var error = Error("Couldn't find service to be removed.");
                this.logErrorAsync(error);
                return Promise.reject(error);
            }
        }
    }, {
        key: "startAsync",
        value: function startAsync() {
            return this.mongoDb.startAsync();
        }
    }, {
        key: "stopAsync",
        value: function stopAsync() {
            var _this13 = this;

            return this._notifySystemsWithRecoveryAsync("deactivatedAsync", []).then(function () {
                return _this13.mongoDb.stopAsync();
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
            var _this14 = this;

            var oldEntity = null;
            var updatedEntity = {
                _id: entity._id ? this.ObjectID(entity._id) : this.ObjectID,
                components: Array.isArray(entity.components) ? entity.components : []
            };

            updatedEntity.components.forEach(function (component) {
                if (!component._id) {
                    component._id = _this14.ObjectID();
                } else {
                    component._id = _this14.ObjectID(component._id);
                }
            });

            return this._findOneAsync(ENTITIES_COLLECTION, {
                _id: updatedEntity._id
            }).then(function (entity) {
                oldEntity = entity;
                updatedEntity._id = oldEntity._id;
                updatedEntity.createdDate = oldEntity.createdDate;

                return _this14._notifySystemsWithRecoveryAsync("prepareEntityToBeUpdatedAsync", [oldEntity, updatedEntity]);
            }).then(function () {
                return _this14.validateEntityToBeUpdatedAsync(oldEntity, updatedEntity);
            }).then(function () {
                return _this14._updateItemInCollectionAsync(ENTITIES_COLLECTION, updatedEntity);
            }).then(function () {
                return _this14._notifySystemsWithRecoveryAsync("entityUpdatedAsync", [oldEntity, updatedEntity]);
            }).then(function () {
                return updatedEntity;
            }).catch(function (error) {
                _this14.logErrorAsync(error);
                throw error;
            });
        }

        /**
         * This allows systems to validate the entity being saved.
         */

    }, {
        key: "validateEntityToBeAddedAsync",
        value: function validateEntityToBeAddedAsync(entity) {
            return this._notifySystemsAsync("validateEntityToBeAddedAsync", [entity]);
        }

        /**
         * This allows systems to validate the entity being saved.
         */

    }, {
        key: "validateEntityToBeUpdatedAsync",
        value: function validateEntityToBeUpdatedAsync(oldEntity, entity) {
            return this._notifySystemsAsync("validateEntityToBeUpdatedAsync", [oldEntity, entity]);
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