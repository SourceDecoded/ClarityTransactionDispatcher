"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityOutOfDateError_1 = require("./EntityOutOfDateError");
const resolvedPromise = Promise.resolve(null);
const ENTITIES_COLLECTION = "entities";
const SYSTEM_DATA_COLLECTION = "systemData";
const NOTICE = "notice";
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
class ClarityTransactionDispatcher {
    /**
     * Create a Dispatcher.
     * @constructor
     */
    constructor(config) {
        this.mongoFactory = config.mongoFactory;
        this.mongodb = this.mongoFactory.createMongodb();
        this.MongoClient = this.mongodb.MongoClient;
        this.ObjectID = this.mongodb.ObjectID;
        this.databaseUrl = config.databaseUrl;
        this.systems = [];
        this.services = {};
        this.entityQueue = new Map();
    }
    /**
     * Add an item to a collection into mongodb.
     * @private
     * @param {string} collectionName - The mongodb collection name.
     * @param {object} item - The item to be added.
     */
    _addItemToCollectionAsync(collectionName, item) {
        item.modifiedDate = new Date();
        item.createdDate = new Date();
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.insertOne(item);
        }).then((result) => {
            item._id = result.insertedId;
            return item;
        });
    }
    _executeOnQueueAsync(entity, actionAsync) {
        var pendingPromise = this.entityQueue.get(entity._id);
        if (pendingPromise == null) {
            return actionAsync();
        }
        else {
            var promise = pendingPromise.then(() => {
                return actionAsync();
            }).catch((error) => {
                return resolvedPromise;
            }).then((result) => {
                if (this.entityQueue.get(entity._id) === promise) {
                    this.entityQueue.delete(entity._id);
                }
                return result;
            });
            this.entityQueue.set(entity._id, promise);
        }
    }
    /**
     * Find one in a collection.
     * @private
     */
    _findOneAsync(collectionName, filter) {
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.findOne(filter);
        });
    }
    /**
    * Find many in a collection.
    * @private
    */
    _findAsync(collectionName, filter, sort, pageSize) {
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
        });
    }
    /**
     * Get count in a collection.
     * @private
     */
    _getCountAsync(collectionName) {
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.count();
        });
    }
    /**
     * Get a mongodb.
     * @private
     * @returns {Promise<mongodb>}
     */
    _getDatabaseAsync() {
        return this.MongoClient.connect(this.databaseUrl);
    }
    /**
     * Initialize a system.
     * @private
     */
    _initializingSystemAsync(system) {
        let systemGuid = system.getGuid();
        let filter = {
            systemGuid
        };
        return this._findOneAsync(SYSTEM_DATA_COLLECTION, filter).then((systemData) => {
            if (systemData == null) {
                let newSystemData = {
                    systemGuid,
                    isInitialized: false
                };
                return this._addItemToCollectionAsync(SYSTEM_DATA_COLLECTION, newSystemData);
            }
            else {
                return systemData;
            }
        }).then((systemData) => {
            if (!systemData.isInitialized) {
                return this._invokeMethodAsync(system, "initializeAsync", [this]).then(() => {
                    systemData.isInitialized = true;
                    return this._updateItemInCollectionAsync(SYSTEM_DATA_COLLECTION, systemData);
                });
            }
        }).catch((error) => {
            this.logError({ message: error.message });
            throw error;
        });
    }
    /**
     * Invoke a method on any object and make sure a promise is the returned value.
     * @private
     */
    _invokeMethodAsync(obj, methodName, args) {
        var returnValue;
        if (typeof obj[methodName] === "function") {
            returnValue = obj[methodName].apply(obj, args);
            if (!(returnValue instanceof Promise)) {
                returnValue = Promise.resolve(returnValue);
            }
        }
        else {
            returnValue = resolvedPromise;
        }
        return returnValue;
    }
    /**
     * Notify the systems of a life cycle by its method name.
     * @private
     * @returns {Promise<undefined>}
     */
    _notifySystemsAsync(methodName, args) {
        return this.systems.reduce((promise, system) => {
            return promise.then(() => {
                try {
                    return this._invokeMethodAsync(system, methodName, args);
                }
                catch (error) {
                    this.logError(error);
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
    _notifySystemsWithRecoveryAsync(methodName, args) {
        return this.systems.reduce((promise, system) => {
            return promise.then(() => {
                try {
                    return this._invokeMethodAsync(system, methodName, args);
                }
                catch (error) {
                    this.logError(error);
                    throw error;
                }
            }).catch(() => {
                return resolvedPromise;
            });
        }, resolvedPromise);
    }
    /**
     * Remove an item from a collection.
     * @private
     * @returns {Promise<undefined>}
     */
    _removeItemfromCollection(collectionName, item) {
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.deleteOne({
                _id: this.ObjectID(item._id)
            });
        });
    }
    /**
     * Update an item in a collection.
     * @private
     * @returns {Promise<undefined>}
     */
    _updateItemInCollectionAsync(collectionName, item) {
        item.modifiedDate = new Date();
        return this._getDatabaseAsync().then((db) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.update({
                _id: this.ObjectID(item._id)
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
    addEntityAsync(entity) {
        let newEntity = {
            _id: entity._id ? this.ObjectID(entity._id) : this.ObjectID(),
            revision: this.ObjectID(),
            components: Array.isArray(entity.components) ? entity.components : []
        };
        newEntity.components.forEach(component => {
            if (!component._id) {
                component._id = this.ObjectID();
            }
            else {
                component._id = this.ObjectID(component._id);
            }
        });
        return this.validateEntityAsync(newEntity).then(() => {
            return this._addItemToCollectionAsync(ENTITIES_COLLECTION, newEntity);
        }).then(entity => {
            var actionAsync = () => {
                return this._notifySystemsWithRecoveryAsync("entityAddedAsync", [entity]).catch(error => {
                    this.logError(error);
                    throw error;
                });
            };
            return this._executeOnQueueAsync(entity, actionAsync).then(() => {
                return entity;
            });
        });
    }
    /**
     * Add a service for systems to use. Services could be HTTP services,
     * or governance that needs to be shared acrossed systems.
     * @param {string} name - The name by which the systems will request the service.
     * @param {object} service - The service.
     * @return {Promise<undefined>}
     */
    addServiceAsync(name, service) {
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
     *  - logError(error: { type?: string; message?: string; })
     *  - logMessage(message: { type?: string; message?: string; })
     *  - logWarning(warning: { type?: string; message?: string; })
     *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - serviceRemovedAsync(name: string)
     *  - validateEntityAsync(entity: IEntity)
     * @param {ISystem} system - The system to add.
     * @return {Promise} - An undefined Promise.
     */
    addSystemAsync(system) {
        if (!this.validateSystem(system)) {
            return Promise.reject(new Error("Invalid system: Systems need to have a getName and a getGuid method on them."));
        }
        else {
            this.systems.push(system);
            return this._initializingSystemAsync(system).then(() => {
                this.logMessage({
                    type: NOTICE,
                    message: `System "${system.getName()}" was initialized.`
                });
                return this._invokeMethodAsync(system, "activatedAsync", [this]);
            }).then(() => {
                this.logMessage({
                    type: NOTICE,
                    message: `System "${system.getName()}" was activated.`
                });
            }).catch(error => {
                this.logError(error);
                throw error;
            });
        }
    }
    /**
   * Approves whether an entity can be removed. Systems can deny the ability to remove entities.
   * @param entity {object} - The entity to be removed.
   */
    approveEntityRemovalAsync(entity) {
        return this._notifySystemsAsync("approveEntityRemovalAsync", [entity]);
    }
    /**
     * Deactivates a system and removes it from the systems being notified. To activate again use addSystemAsync.
     * Think of this like a pause. The dispatcher calls deactivatedAsync on the system being removed.
     * @param {ISystem} system - The system to be deactivate.
     * @returns {Promise<undefined>} - Resolves when the system is deactivated.
     */
    deactivateSystemAsync(system) {
        let deactivatedPromise;
        let index = this.systems.indexOf(system);
        if (index === -1) {
            return Promise.reject(new Error("Couldn't find system to be deactivated."));
        }
        else {
            this.systems.splice(index, 1);
            try {
                return deactivatedPromise = this._invokeMethodAsync(system, "deactivatedAsync", []).then(() => {
                    this.logMessage({
                        type: NOTICE,
                        message: `System "${system.getName()}" was deactivated.`
                    });
                }).catch(() => {
                    return resolvedPromise;
                });
            }
            catch (error) {
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
    disposeSystemAsync(system) {
        var disposedPromise;
        var index = this.systems.indexOf(system);
        if (index === -1) {
            return Promise.reject(new Error("Couldn't find system to be disposed."));
        }
        else {
            this.systems.splice(index, 1);
            try {
                return disposedPromise = this._invokeMethodAsync(system, "disposedAsync", []).then(() => {
                    this.logMessage({
                        type: NOTICE,
                        message: `System "${system.getName()}" was disposed.`
                    });
                }).catch(() => {
                    return resolvedPromise;
                });
            }
            catch (error) {
                return resolvedPromise;
            }
        }
    }
    /**
     * Page through entities using the lastId from a previous query. Use null or undefined to begin at the beginning.
     * @param config {} - The configuration of the query. It takes a lastId, pageSize, lastModifiedDate, and a lastCreatedDate.
     */
    getEntitiesAsync(config) {
        let lastId = config.lastId ? this.ObjectID(config.lastId) : null;
        let pageSize = config.pageSize < 50 ? config.pageSize : 50;
        let lastModifiedDate = config.lastModifiedDate;
        let lastCreatedDate = config.lastCreatedDate;
        let sort = [["_id", 1]];
        let filter = {};
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
        return this._findAsync(ENTITIES_COLLECTION, filter, sort, pageSize).then(entities => {
            let notifySystemsPromises = entities.map(entity => {
                return this._notifySystemsWithRecoveryAsync("entityRetrievedAsync", [entity]);
            });
            return Promise.all(notifySystemsPromises).then(() => {
                return entities;
            });
        }).catch(error => {
            this.logError(error);
            throw error;
        });
    }
    /**
     * Get an entity by its id.
     * @param {string} entityId - The id of the desired entity.
     * @return {Promise<Entity>} - A Promise resolved with the entity or null.
     */
    getEntityByIdAsync(entityId) {
        return this._findOneAsync(ENTITIES_COLLECTION, {
            _id: this.ObjectID(entityId)
        }).then(entity => {
            return this._notifySystemsWithRecoveryAsync("entityRetrievedAsync", [entity]).then(() => {
                return entity;
            });
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
    }
    /**
     * Get count for all entities in collection.
     */
    getEntityCountAsync() {
        return this._getCountAsync(ENTITIES_COLLECTION);
    }
    /**
     * Get a service by the name given.
     * @param {string} name - The name of the desired service.
     * @returns {object} - Null or the desired service.
     */
    getService(name) {
        return this.services[name] || null;
    }
    /**
     * Get all systems.
     * @returns {Array<ISystems>}
     */
    getSystems() {
        return this.systems;
    }
    /**
     * Notifies the systems about an error.
     * @param error {object} - The error to be sent to the systems.
     * @returns {undefined}
     */
    logError(error) {
        this._notifySystemsAsync("logError", [error]);
    }
    /**
     * Notifies the systems about a message.
     * @param message {object} - The message to be sent to the systems.
     * @returns {undefined}
     */
    logMessage(message) {
        this._notifySystemsAsync("logMessage", [message]);
    }
    /**
     * Notifies the systems about a warning.
     * @param warning {object} - The warning to be sent to the systems.
     * @returns {undefined}
     */
    logWarning(warning) {
        this._notifySystemsAsync("logWarning", [warning]);
    }
    /**
     * Removes the entity to be removed and notifies the systems the entity has been removed.
     * @param {IEntity} entity - The entity to be removed.
     * @returns {Promise<undefined>}
     */
    removeEntityAsync(entity) {
        var promise = this._executeOnQueueAsync(entity, () => {
            return this._removeItemfromCollection(ENTITIES_COLLECTION, entity).then(() => {
                return this._notifySystemsWithRecoveryAsync("entityRemovedAsync", [entity]);
            }).catch(error => {
                this.logError(error);
                throw error;
            });
        }).then(() => {
            return entity;
        });
        return promise;
    }
    /**
     * Removes a service by its name. The dispatcher will notify the systems that this service is being
     * removed.
     * @param {string} name - The name of the service to be removed.
     * @returns {undefined}
     */
    removeServiceAsync(name) {
        if (this.services[name]) {
            delete this.services[name];
            return this._notifySystemsWithRecoveryAsync("serviceRemovedAsync", [name]);
        }
        else {
            var error = Error("Couldn't find service to be removed.");
            this.logError(error);
            return Promise.reject(error);
        }
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
    updateEntityAsync(entity) {
        let updatedEntity = {
            _id: entity._id ? this.ObjectID(entity._id) : this.ObjectID,
            revision: entity.revision,
            components: Array.isArray(entity.components) ? entity.components : []
        };
        updatedEntity.components.forEach(component => {
            if (!component._id) {
                component._id = this.ObjectID();
            }
            else {
                component._id = this.ObjectID(component._id);
            }
        });
        var actionAsync = () => {
            return this.validateEntityAsync(updatedEntity).then(() => {
                return this._findOneAsync(ENTITIES_COLLECTION, {
                    _id: updatedEntity._id
                });
            }).then((oldEntity) => {
                if (oldEntity.revision != updatedEntity.revision) {
                    var error = new EntityOutOfDateError_1.default("Entity out of date.");
                    error.name = "OutOfDate";
                    error.currentRevision = oldEntity;
                    throw error;
                }
                updatedEntity._id = oldEntity._id;
                updatedEntity.revision = this.ObjectID();
                updatedEntity.createdDate = oldEntity.createdDate;
                return this._updateItemInCollectionAsync(ENTITIES_COLLECTION, updatedEntity).then(() => {
                    return oldEntity;
                });
            }).then((oldEntity) => {
                return this._notifySystemsWithRecoveryAsync("entityUpdatedAsync", [oldEntity, updatedEntity]);
            }).then(() => {
                return updatedEntity;
            }).catch((error) => {
                this.logError(error);
                throw error;
            });
        };
        return this._executeOnQueueAsync(entity, actionAsync);
    }
    /**
     * This allows systems to validate the entity being saved.
     */
    validateEntityAsync(entity) {
        return this._notifySystemsAsync("validateEntityAsync", [entity]);
    }
    /**
     * Ensures the system has the required methods.
     * @param {ISystem} system - The System to be validated.
     */
    validateSystem(system) {
        if (typeof system.getGuid !== "function" ||
            typeof system.getName !== "function") {
            return false;
        }
        return true;
    }
}
exports.default = ClarityTransactionDispatcher;
//# sourceMappingURL=ClarityTransactionDispatcher.js.map