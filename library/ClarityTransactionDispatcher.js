"use strict";
const uuid = require("node-uuid");
const MongoDbIterator_1 = require("./MongoDbIterator");
const NullableLogger_1 = require("./NullableLogger");
const nullableLogger = new NullableLogger_1.default();
const resolvedPromise = Promise.resolve();
const ENTITIES_COLLECTION = "entities";
const COMPONENTS_COLLECTION = "components";
const SYSTEM_DATA_COLLECTION = "systemData";
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
 *
 * The dispatcher will also notify the system when components on the entity
 * have been added updated or removed. This is critical for the systems to
 * fulfill their responsibilities efficiently.
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
    }
    _addItemToGridFs(stream) {
        var newContentId = uuid.v4();
        stream.pause();
        return this._getGridFsAsync().then((gfs) => {
            return new Promise((resolve, reject) => {
                var writeStream = gfs.createWriteStream({
                    _id: this.ObjectID(newContentId)
                });
                stream.on("end", () => {
                    resolve(newContentId);
                });
                stream.on("error", (error) => {
                    reject(error);
                });
                stream.pipe(writeStream);
                stream.resume();
            });
        });
    }
    /**
     * Add an item to a collection.
     * @private
     */
    _addItemToCollectionAsync(item, collectionName) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        collection.insertOne(item, (error, result) => {
                            if (error != null) {
                                reject(error);
                            }
                            else {
                                resolve(result);
                            }
                        });
                    }
                });
            });
        });
    }
    /**
     * Find one in a collection.
     * @private
     */
    _findOneAsync(collectionName, filter) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        collection.findOne(filter, function (error, item) {
                            if (error != null) {
                                reject(error);
                            }
                            else {
                                resolve(item);
                            }
                        });
                    }
                });
            });
        });
    }
    /**
    * Find many in a collection.
    * @private
    */
    _findAsync(collectionName, filter) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        collection.find(filter).toArray((error, items) => {
                            if (error != null) {
                                reject(error);
                            }
                            else {
                                resolve(items);
                            }
                        });
                    }
                });
            });
        });
    }
    /**
     * Get a mongodb.
     * @private
     * @returns {Promise<mongodb>}
     */
    _getDatabaseAsync() {
        return new Promise((resolve, reject) => {
            this.MongoClient.connect(this.databaseUrl, (error, db) => {
                if (error != null) {
                    reject(error);
                }
                else {
                    resolve(db);
                }
            });
        });
    }
    /**
     * Get a gridFs.
     * @private
     * @returns {Promise<gridfs>}
     */
    _getGridFsAsync() {
        return this._getDatabaseAsync().then((db) => {
            return this.mongoFactory.createGridFs(db, this.mongodb);
        });
    }
    /**
     * Get the logger.
     * @private
     */
    _getLogger() {
        return this.services["logger"] || nullableLogger;
    }
    /**
     * Initialize a system.
     * @private
     */
    _initializingSystemAsync(system) {
        var filter = {
            systemGuid: system.getGuid()
        };
        return this._findOneAsync(SYSTEM_DATA_COLLECTION, filter).then((systemData) => {
            if (systemData == null) {
                var newSystemData = {
                    systemGuid: system.getGuid(),
                    isInitialized: false
                };
                return this._addItemToCollectionAsync(newSystemData, SYSTEM_DATA_COLLECTION);
            }
            else {
                return systemData;
            }
        }).then((systemData) => {
            if (!systemData.isInitialized) {
                return this._invokeMethodAsync(system, "initializeAsync", [this]).then(() => {
                    systemData.isInitialized = true;
                    return this._updateItemInCollectionAsync(systemData, SYSTEM_DATA_COLLECTION);
                });
            }
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
                    this._getLogger().error(error.message, error);
                    return resolvedPromise;
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
                    this._getLogger().error(error.message, error);
                    return resolvedPromise;
                }
            }).catch(() => {
                return resolvedPromise;
            });
        }, resolvedPromise);
    }
    /**
     * Remove the content of an entity.
     * @private
     */
    _removeItemFromGridFsAsync(id) {
        return this._getGridFsAsync().then((gfs) => {
            return new Promise((resolve, reject) => {
                gfs.remove({
                    _id: id
                }, function (error) {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }).catch((error) => {
            this._getLogger().error(error.message, error);
            // It may not have been able to find the file.
            return resolvedPromise;
        });
    }
    /**
     * Remove and item from a collection
     * @private
     * @returns {Promise<undefined>}
     */
    _removeItemfromCollection(item, collectionName) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        collection.deleteOne({
                            _id: this.ObjectID(item._id)
                        }, (error, result) => {
                            if (error != null) {
                                reject(error);
                            }
                            else {
                                resolve(result);
                            }
                        });
                    }
                });
            });
        });
    }
    /**
     * Update an item in a collection.
     * @private
     * @returns {Promise<undefined>}
     */
    _updateItemInCollectionAsync(item, collectionName) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        collection.update({
                            _id: this.ObjectID(item._id)
                        }, item, null, (error, result) => {
                            if (error != null) {
                                reject(error);
                            }
                            else {
                                resolve(result);
                            }
                        });
                    }
                });
            });
        });
    }
    /**
     * Adds a component to an entity.
     *
     * The dispatcher does the following when adding a component.
     *
     * - Validate the component with all systems. All systems have to validate to pass.
     * - Saves the component to the datastore.
     * - Notifies the systems that a component has been added.
     * @param {object} entity - The entity of the component being added.
     * @param {object} component - The component being added.
     */
    addComponentAsync(entity, component) {
        component.entity_id = entity._id;
        return this.validateComponentAsync(entity, component).then(() => {
            return this._addItemToCollectionAsync(component, COMPONENTS_COLLECTION);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityComponentAddedAsync", [entity, component]);
        });
    }
    /**
     * Add an Entity to the datastore. The steps the dispatcher takes when saving an
     * entity are.
     *
     * - Saves the content of the entity to a datastore.
     * - Validate the entity with all systems. All systems have to validate to pass.
     * - Save the entity to the datastore.
     * - Validate and save the components.
     * - Notify the systems that an entity with its components and content have been saved.
     * - If any of the steps above fail, it will retract the whole transaction and notify the systems of doing so.
     * @param {object} entity - The entity you want to add.
     * @param {NodeJS.ReadableStream} stream - The content of the entity.
     * @param {Array<component>} components - An array of components belonging to the entity.
     * @return {Promise}
     */
    addEntityAsync(entity, contentStream, components) {
        var contentPromise;
        var entityId;
        var contentId;
        var savedComponents;
        var savedEntity;
        if (contentStream == null) {
            contentPromise = Promise.resolve(null);
        }
        else {
            contentPromise = this._addItemToGridFs(contentStream);
        }
        return contentPromise.then(() => {
            // Validate the entity.
            return this.validateEntityAsync(entity);
        }).then((id) => {
            // Save the entity.
            contentId = id;
            entity.content_id = contentId;
            return this._addItemToCollectionAsync(entity, ENTITIES_COLLECTION);
        }).then((result) => {
            // Validate and save all the components. 
            savedEntity = result;
            entityId = result._id;
            return components.reduce((promise, component) => {
                return this.validateComponentAsync(savedEntity, component).then(() => {
                    return this._addItemToCollectionAsync(component, COMPONENTS_COLLECTION);
                }).then((savedComponent) => {
                    savedComponents.push(savedComponent);
                });
            }, resolvedPromise);
        }).then(() => {
            // Notify the systems of all that has taken place.
            return this._notifySystemsWithRecoveryAsync("entityAddedAsync", [entity]).then(() => {
                return this._notifySystemsWithRecoveryAsync("entityContentUpdatedAsync", [null, contentId]);
            }).then(() => {
                return savedComponents.reduce((promise, component) => {
                    return this._notifySystemsWithRecoveryAsync("entityComponentAddedAsync", [savedEntity, component]);
                }, resolvedPromise);
            });
        }).catch((error) => {
            // Sense we save the content first we may have the content saved and not the entity.
            // If we were able to save the entity then the removeEntityAsync will take care of removing the content.
            // Otherwise we need to remove the content manually.
            if (savedEntity != null) {
                this.removeEntityAsync(savedEntity);
            }
            else {
                if (contentId != null) {
                    this._removeItemFromGridFsAsync(contentId);
                }
            }
            return Promise.reject(error);
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
     * - Invokes initializeAsync if the systems hasn't been used before, and invokes
     * activatedAsync after initializeAsync is finished.
     *
     * For example an Image Thumbnail System will look to see if the entity has the
     * component of image
     * #### Required System Methods
     * - getGuid()
     * - getName()
     *
     * #### Optional System Methods
     *  - activatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - deactivatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - disposeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - entityAddedAsync(entity: {_id: string})
     *  - entityUpdatedAsync(oldEntity: any, newEntity: any)
     *  - entityRemovedAsync(entity: {_id: string})
     *  - entityContentUpdatedAsync(oldContentId: string, newContentId: string)
     *  - entityComponentAddedAsync(entity: {_id: string}, component: any)
     *  - entityComponentUpdatedAsync(entity: {_id: string}, oldComponent: any, newComponent: any)
     *  - entityComponentRemovedAsync(entity: {_id: string}, component: any)
     *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - serviceRemovedAsync(name: string, service: any);
     *  - validateEntityAsync(entity: {_id: string})
     *  - validateComponentAsync(component: {_id: string})
     *  - validateEntityContentAsync(entity: {_id: string}, oldContentId: string, newContentId: string)
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
                return this._invokeMethodAsync(system, "activatedAsync", [this]);
            }).catch((error) => {
                return Promise.reject(error);
            });
        }
    }
    /**
     * Deactivates a system and removes it from the systems being notified. To activate again use addSystemAsync.
     * Think of this like a pause. The dispatcher calls deactivatedAsync on the system being removed.
     * @param {ISystem} system - The system to be deactivate.
     * @returns {Promise<undefined>} - Resolves when the system is deactivated.
     */
    deactivateSystemAsync(system) {
        var deactivatedPromise;
        var index = this.systems.indexOf(system);
        if (index === -1) {
            return Promise.reject(new Error("Couldn't find system to be deactivated."));
        }
        else {
            this.systems.splice(index, 1);
            try {
                return deactivatedPromise = this._invokeMethodAsync(system, "deactivatedAsync", []).catch(() => {
                    return resolvedPromise;
                });
            }
            catch (e) {
                return resolvedPromise;
            }
        }
    }
    /**
     * Disposes a system and removes it from the systems being notified. Use then when removing systems for
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
                return disposedPromise = this._invokeMethodAsync(system, "disposeAsync", []).catch(() => {
                    return resolvedPromise;
                });
            }
            catch (e) {
                return resolvedPromise;
            }
        }
    }
    /**
     * Gets the component by the id provided.
     * @param {string} componentId - The id of the component.
     * @return {Promise<Array>}
     */
    getComponentAsync(componentId) {
        var id = this.ObjectID(componentId);
        return this._findOneAsync(COMPONENTS_COLLECTION, {
            _id: id
        });
    }
    /**
     * Get the components of an entity by the entity.
     * @param {object} entity - The entity of the components.
     * @return {Promise<Array>}
     */
    getComponentsByEntityAsync(entity) {
        var entityId = this.ObjectID(entity._id);
        var filter = {
            entity_id: entityId
        };
        return this._findAsync(COMPONENTS_COLLECTION, filter);
    }
    /**
     * Get the Components on the entity provided matching the type provided.
     * @param {object} entity - The entity of the needed components.
     * @param {string} type - The type of the component needed.
     */
    getComponentsByEntityAndTypeAsync(entity, type) {
        var entityId = this.ObjectID(entity._id);
        var filter = {
            entity_id: entityId,
            type: type
        };
        return this._findAsync(COMPONENTS_COLLECTION, filter);
    }
    /**
     * Get an entity by its id.
     * @param {string} entityId - The id of the desired entity.
     * @return {Promise<Entity>} - A Promise resolved with the entity or null.
     */
    getEntityByIdAsync(entityId) {
        var filter = {
            _id: this.ObjectID(entityId)
        };
        return this._findOneAsync(ENTITIES_COLLECTION, filter);
    }
    /**
     * Get a stream of the content of the entity.
     * @param {object} entity - The entity of the content needed.
     * @returns {Promise<stream>} - Node read stream.
     */
    getEntityContentStreamByEntityAsync(entity) {
        return this._getGridFsAsync().then((gfs) => {
            var id = this.ObjectID(entity.content_id);
            return gfs.createReadStream({
                _id: id
            });
        });
    }
    /**
     * Get a stream of the content of the entity by its id.
     * @param {string} contentId - The id of the content needed..
     * @returns {NodeJS.ReadableStream} - Node read stream.
     */
    getEntityContentStreamByContentIdAsync(contentId) {
        return this._getGridFsAsync().then((gfs) => {
            return gfs.createReadStream({
                _id: this.ObjectID(contentId)
            });
        });
    }
    /**
     * Get an Iterator of the all entities.
     * @return {MongoDbIterator}
     */
    getEntitiesIterator() {
        return new MongoDbIterator_1.default({
            databaseUrl: this.databaseUrl,
            collectionName: ENTITIES_COLLECTION,
            MongoClient: this.MongoClient
        });
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
     * Remove a component from an entity.
     * @param {object} component - The component to be removed.
     * @returns {Promise<undefined>}
     */
    removeComponentAsync(component) {
        return this._removeItemfromCollection(component, COMPONENTS_COLLECTION).then(() => {
            return this.getEntityByIdAsync(component.entity_id);
        }).then((entity) => {
            return this._notifySystemsWithRecoveryAsync("entityComponentRemovedAsync", [entity, component]);
        });
    }
    /**
     * Removes an entity, and its associated content. The dispatcher does the following to remove an entity.
     *
     * - Removes all of the components on the entity notifying the systems that the components have been removed.
     * - Removes the content and notifies the systems.
     * - Removes the entity to be removed and notifies the systems the entity has been removed.
     * @param {object} entity - The entity to be removed.
     * @returns {Promise<undefined>}
     */
    removeEntityAsync(entity) {
        return this.getComponentsByEntityAsync(entity).then((components) => {
            return components.reduce((promise, component) => {
                return promise.then(() => {
                    return this.removeComponentAsync(component);
                }).catch((error) => {
                    return resolvedPromise;
                });
            }, resolvedPromise);
        }).then(() => {
            return this.removeEntityContentAsync(entity);
        }).then(() => {
            return this._removeItemfromCollection(entity, "entities");
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityRemovedAsync", [entity]);
        });
    }
    /**
     * Removes the content of an entity.
     */
    removeEntityContentAsync(entity) {
        var contentId = entity.content_id;
        if (contentId == null) {
            return resolvedPromise;
        }
        return this._removeItemFromGridFsAsync(contentId).then(() => {
            entity.content_id = null;
            return this.updateEntityAsync(entity);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityContentUpdatedAsync", [null, contentId]);
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
            return this._notifySystemsWithRecoveryAsync("serviceRemovedAsync", [name, this.services[name]]);
        }
        else {
            return Promise.reject(new Error("Couldn't find service to be removed."));
        }
    }
    /**
     * Updated an entity. The dispatcher will perform the following actions when updating.
     * This really shouldn't be used much. The entity is really just a container for the
     * content_id and the components.
     *
     * - Validate the entity. All interested systems need to validate to pass.
     * - Entity's updates are saved.
     * - The systems are notified about the update.
     * @param {object} entity - The updated entity.
     * @returns {Promise<undefined>} - Resolves when the entity is saved.
     */
    updateEntityAsync(entity) {
        return this.validateEntityAsync(entity).then(() => {
            return this._findOneAsync(ENTITIES_COLLECTION, {
                _id: this.ObjectID(entity._id)
            });
        }).then((oldEntity) => {
            return this._updateItemInCollectionAsync(entity, ENTITIES_COLLECTION).then(() => {
                return oldEntity;
            });
        }).then((oldEntity) => {
            return this._notifySystemsWithRecoveryAsync("entityUpdatedAsync", [oldEntity, entity]);
        });
    }
    /**
     * Update an entity's content. The dispatcher will perform the following actions when
     * updated the content of an entity.
     *
     * - Save the new content to the datastore.
     * - Validate the new content. All interested systems need to validate to pass.
     * - The entity.content_id is updated and saved.
     * - Notify the systems of the updated content.
     * - The old content is now removed from the datastore.
     *
     * @param {object} entity - The entity whos content is to be update.
     * @param {NodeJS.WritableStream}  - The stream to save to the content of the entity.
     * @return {Promise<undefined>}
     */
    updateEntityContentByStreamAsync(entity, stream) {
        var contentId = null;
        var oldContentId = entity.content_id;
        return this._addItemToGridFs(stream).then((id) => {
            entity.content_id = this.ObjectID(id);
            return this._updateItemInCollectionAsync(entity, "entities");
        }).then(() => {
        }).catch(() => {
            if (contentId != null) {
            }
        });
    }
    /**
     * Update a component. The dispatcher will perform the following actions when
     * updating the component of an entity.
     *
     * - Validate the component. All interested systesm need to validate to pass.
     * - Save the component to the datastore.
     * - Notify the systems that the component was updated.
     *
     * @param {object} component - The component to be updated.
     */
    updateComponentAsync(entity, component) {
        return this.validateComponentAsync(entity, component).then(() => {
            return this._findOneAsync(COMPONENTS_COLLECTION, {
                _id: this.ObjectID(component._id)
            });
        }).then((oldComponent) => {
            return this._updateItemInCollectionAsync(component, COMPONENTS_COLLECTION).then(() => {
                return oldComponent;
            });
        }).then((oldComponent) => {
            return this._notifySystemsWithRecoveryAsync("componentUpdatedAsync", [oldComponent, component]);
        });
    }
    /**
     * This allows systems to validate the component being saved.
     */
    validateComponentAsync(entity, component) {
        return this._notifySystemsAsync("validateComponentAsync", [entity, component]);
    }
    /**
     * This allows systems to validate the entity being saved.
     */
    validateEntityAsync(entity) {
        return this._notifySystemsAsync("validateEntityAsync", [entity]);
    }
    /**
     * This allows the systems to validate content before its accepted.
     * The dispatcher saves it to a temporary location so systems can validate it
     * independently. The content could be an extremely large file so we don't want
     * to hold it in memory.
     */
    validateEntityContentAsync(entity, newContentId) {
        return this._notifySystemsAsync("validateEntityContentAsync", [entity, newContentId]);
    }
    validateSystem(system) {
        if (typeof system.getGuid !== "function" ||
            typeof system.getName !== "function") {
            return false;
        }
        return true;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClarityTransactionDispatcher;
//# sourceMappingURL=ClarityTransactionDispatcher.js.map