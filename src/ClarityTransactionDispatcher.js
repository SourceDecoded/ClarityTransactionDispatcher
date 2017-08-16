import * as fs from "fs";
import * as uuid from "node-uuid";
import Query from "./Query";

const resolvedPromise = Promise.resolve(null);
const ENTITIES_COLLECTION = "entities";
const SYSTEM_DATA_COLLECTION = "systemData";
const NOTICE = "notice";
const DATABASE_URL = "clarity_transaction_dispatcher";
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
export default class ClarityTransactionDispatcher {
    /**
     * Create a Dispatcher.
     * @constructor
     */
    constructor(mongoDb) {
        this.mongoDb = mongoDb;
        this.ObjectID = mongoDb.getObjectID();
        this.systems = [];
        this.services = {};
        this.isInitialized = false;
        this.startedPromise = null;
        this.stoppedPromise = null;
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

    _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
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
        return this.mongoDb.getDatabaseAsync(DATABASE_URL);
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
            this.logErrorAsync({ message: error.message });
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
                    if (methodName !== "logErrorAsync") {
                        this.logErrorAsync(error);
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
    _notifySystemsWithRecoveryAsync(methodName, args) {
        return this.systems.reduce((promise, system) => {
            return promise.then(() => {
                try {
                    return this._invokeMethodAsync(system, methodName, args);
                }
                catch (error) {
                    this.logErrorAsync(error);
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

        return this._notifySystemsWithRecoveryAsync("prepareEntityToBeAddedAsync", [newEntity]).then(() => {
            return this.validateEntityToBeAddedAsync(newEntity);
        }).then(() => {
            return this._addItemToCollectionAsync(ENTITIES_COLLECTION, newEntity);
        }).then(entity => {
            return this._notifySystemsWithRecoveryAsync("entityAddedAsync", [entity]).then(() => {
                return entity;
            });
        }).catch(error => {
            this.logErrorAsync(error);
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
    addSystemAsync(system) {
        if (!this.validateSystem(system)) {
            return Promise.reject(new Error("Invalid system: Systems need to have a getName and a getGuid method on them."));
        }
        else {
            this.systems.push(system);
            return this._initializingSystemAsync(system).then(() => {
                this.logMessageAsync({
                    type: NOTICE,
                    message: `System "${system.getName()}" was initialized.`
                });
                return this._invokeMethodAsync(system, "activatedAsync", [this]);
            }).then(() => {
                this.logMessageAsync({
                    type: NOTICE,
                    message: `System "${system.getName()}" was activated.`
                });
            }).catch(error => {
                this.logErrorAsync(error);
                throw error;
            });
        }
    }

    /**
   * Approves whether an entity can be removed. Systems can deny the ability to remove entities.
   * @param entity {object} - The entity to be removed.
   */
    approveEntityToBeRemovedAsync(entity) {
        return this._notifySystemsAsync("approveEntityToBeRemovedAsync", [entity]);
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
                    this.logMessageAsync({
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
                    this.logMessageAsync({
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
     * This allows you to define a query for entities, and then manages the iteration over the entities.
     */
    getQuery() {
        return new Query({
            mongoDb: this.mongoDb,
            collectionName: ENTITIES_COLLECTION,
            databaseName: DATABASE_URL
        });
    }

    /**
     * Page through entities using the lastId from a previous query. Use null or undefined to begin at the beginning.
     * @param config {} - The configuration of the query. It takes a lastId, pageSize, lastModifiedDate, and a lastCreatedDate.
     */
    getEntitiesAsync(config = {}) {
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
            this.logErrorAsync(error);
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
            this.logErrorAsync(error);
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
    logErrorAsync(error) {
        this._notifySystemsAsync("logErrorAsync", [error]);
    }
    /**
     * Notifies the systems about a message.
     * @param message {object} - The message to be sent to the systems.
     * @returns {undefined}
     */
    logMessageAsync(message) {
        this._notifySystemsAsync("logMessageAsync", [message]);
    }
    /**
     * Notifies the systems about a warning.
     * @param warning {object} - The warning to be sent to the systems.
     * @returns {undefined}
     */
    logWarningAsync(warning) {
        this._notifySystemsAsync("logWarningAsync", [warning]);
    }
    /**
     * Removes the entity to be removed and notifies the systems the entity has been removed.
     * @param {IEntity} entity - The entity to be removed.
     * @returns {Promise<undefined>}
     */
    removeEntityAsync(entity) {
        return this.approveEntityToBeRemovedAsync(entity).then(() => {
            return this._removeItemfromCollection(ENTITIES_COLLECTION, entity);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityRemovedAsync", [entity]);
        }).then(() => {
            return entity;
        }).catch(error => {
            this.logErrorAsync(error);
            throw error;
        });
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
            this.logErrorAsync(error);
            return Promise.reject(error);
        }
    }

    startAsync() {
        if (this.startedPromise == null) {
            var stoppedPromise = this.stoppedPromise;

            if (stoppedPromise == null) {
                stoppedPromise = resolvedPromise;
            }

            return this.startedPromise = stoppedPromise.then(() => {
                this._notifySystemsWithRecoveryAsync("activatedAsync", [this])
            }).then(() => {
                this.isInitialized = true;
            });

        } else {
            return this.startedPromise;
        }
    }

    stopAsync() {
        if (this.stoppedPromise == null) {

            var startedPromise = this.startedPromise;

            if (startedPromise == null) {
                startedPromise = resolvedPromise;
            }

            return this.stoppedPromise = startedPromise.then(() => {
                return this._notifySystemsWithRecoveryAsync("deactivatedAsync", []);
            }).then(() => {
                this.isInitialized = false;
            });

        } else {
            return this.stoppedPromise;
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
        let oldEntity = null;
        let updatedEntity = {
            _id: entity._id ? this.ObjectID(entity._id) : this.ObjectID,
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

        return this._findOneAsync(ENTITIES_COLLECTION, {
            _id: updatedEntity._id
        }).then((entity) => {
            oldEntity = entity;
            updatedEntity._id = oldEntity._id;
            updatedEntity.createdDate = oldEntity.createdDate;

            return this._notifySystemsWithRecoveryAsync("prepareEntityToBeUpdatedAsync", [oldEntity, updatedEntity]);
        }).then(() => {
            return this.validateEntityToBeUpdatedAsync(oldEntity, updatedEntity);
        }).then(() => {
            return this._updateItemInCollectionAsync(ENTITIES_COLLECTION, updatedEntity);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityUpdatedAsync", [oldEntity, updatedEntity]);
        }).then(() => {
            return updatedEntity;
        }).catch((error) => {
            this.logErrorAsync(error);
            throw error;
        });
    }

    /**
     * This allows systems to validate the entity being saved.
     */
    validateEntityToBeAddedAsync(entity) {
        return this._notifySystemsAsync("validateEntityToBeAddedAsync", [entity]);
    }

    /**
     * This allows systems to validate the entity being saved.
     */
    validateEntityToBeUpdatedAsync(oldEntity, entity) {
        return this._notifySystemsAsync("validateEntityToBeUpdatedAsync", [oldEntity, entity]);
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