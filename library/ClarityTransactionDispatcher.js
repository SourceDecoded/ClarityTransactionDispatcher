"use strict";
const mongodb_1 = require("mongodb");
const Grid = require("gridfs-stream");
const MongoDbIterator_1 = require("./MongoDbIterator");
const NullableLogger_1 = require("./NullableLogger");
const nullableLogger = new NullableLogger_1.default();
const resolvedPromise = Promise.resolve();
const ENTITIES_COLLECTION = "entities";
const COMPONENTS_COLLECTION = "components";
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
        this.MongoClient = config.MongoClient;
        this.databaseUrl = config.databaseUrl;
    }
    /**
     * Add an item to a collection.
     * @private
     */
    _addItemToCollectionAsync(item, collectionName) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(collectionName).insertOne(item, (error, result) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
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
                db.collection(collectionName).findOne(filter, function (error, item) {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(item);
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
                db.collection(collectionName).find(filter).toArray((error, items) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(items);
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
            mongodb_1.MongoClient.connect(this.databaseUrl, (error, db) => {
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
            return Grid(db, mongodb_1.default);
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
    _removeEntityContentAsync(contentId) {
        return this._getGridFsAsync().then((gfs) => {
            return new Promise((resolve, reject) => {
                gfs.remove({
                    _id: contentId
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
                db.collection(collectionName).deleteOne({
                    _id: mongodb_1.default.ObjectID(item._id)
                }, item, (error, result) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
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
    _updateItemInCollection(item, collectionName) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection(collectionName).update({
                    _id: mongodb_1.default.ObjectID(item._id)
                }, item, (error, result) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        });
    }
    /**
     * This allows systems to validate the component being saved.
     * @private
     */
    _validateComponentAsync(entity, component) {
        return this._notifySystemsAsync("validateComponentAsync", [entity, component]);
    }
    /**
     * This allows systems to validate the entity being saved.
     * @private
     */
    _validateEntityAsync(entity) {
        return this._notifySystemsAsync("validateEntityAsync", [entity]);
    }
    /**
     * This allows the systems to validate content before its accepted.
     * The dispatcher saves it to a temporary location so systems can validate it
     * independently. The content could be an extremely large file so we don't want
     * to hold it in memory.
     * @private
     */
    _validateEntityContentAsync(entity, newContentId) {
        return this._notifySystemsAsync("validateEntityContentAsync", [entity, newContentId]);
    }
    /**
     * Add an Entity to the datastore. The steps the dispatcher takes when saving an
     * entity are.
     *
     * - Validate the entity with all systems. All systems have to validate to pass.
     * - Save the entity to the datastore.
     * - Notify the systems that an entity has been saved to the datastore.
     * @param {object} entity - The entity you want to add.
     * @return {Promise}
     */
    addEntityAsync(entity) {
        return this._validateEntityAsync(entity).then(() => {
            return this._addItemToCollectionAsync(entity, ENTITIES_COLLECTION);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityAddedAsync", [entity]);
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
        return this._validateEntityAsync(entity).then(() => {
            return this._addItemToCollectionAsync(entity, COMPONENTS_COLLECTION);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityComponentAddedAsync", [entity, component]);
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
     *  - validateEntityContentAsync(entity: {_id: string}, newContentId: string)
     * @param {ISystem} system - The system to add.
     * @return {Promise} - An undefined Promise.
     */
    addSystemAsync(system) {
        this.systems.push(system);
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
        var deactivatedPromise;
        var index = this.systems.indexOf(system);
        if (index === -1) {
            return Promise.reject(new Error("Couldn't find system to be disposed."));
        }
        else {
            this.systems.splice(index, 1);
            try {
                return deactivatedPromise = this._invokeMethodAsync(system, "disposeAsync", []).catch(() => {
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
        var id = mongodb_1.default.ObjectID(componentId);
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
        var entityId = mongodb_1.default.ObjectID(entity._id);
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
        var entityId = mongodb_1.default.ObjectID(entity._id);
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
            _id: entityId
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
            var id = mongodb_1.default.ObjectId(entity.content_id);
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
            var id = mongodb_1.default.ObjectId(contentId);
            return gfs.createReadStream({
                _id: id
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
            collectionName: "enities",
            MongoClient: mongodb_1.MongoClient
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
     * Removes the content of an entity.
     */
    removeEntityContentAsync(entity) {
        var contentId = entity.content_id;
        this._removeEntityContentAsync(contentId).then(() => {
            entity.content_id = null;
            return this.updateEntityAsync(entity);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityContentUpdatedAsync", [null, contentId]);
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
    }
    /**
     * Updated an entity.
     * @param {object} entity - The updated entity.
     * @returns {Promise<undefined>} - Resolves when the entity is saved.
     */
    updateEntityAsync(entity) {
    }
    /**
     * Update an entity's content.
     * @param {object} entity - The entity whos content is to be update.
     * @param {NodeJS.WritableStream}  - The stream to save to the content of the entity.
     * @return {undefined}
     */
    updateEntityContentByStream(entity, stream) {
    }
    /**
     * Update a component.
     * @param {object} component - The component to be updated.
     */
    updateComponentAsync(component) {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClarityTransactionDispatcher;
//# sourceMappingURL=ClarityTransactionDispatcher.js.map