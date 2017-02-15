"use strict";
const mongodb_1 = require("mongodb");
const Grid = require("gridfs-stream");
const MongoDbIterator_1 = require("./MongoDbIterator");
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
     * Notify the systems of a life cycle.
     * @private
     */
    _notifySystems(methodName, args) {
        return this.systems.reduce((promise, system) => {
            return promise.then(() => {
                if (typeof system[methodName] === "function") {
                    return system[methodName].apply(system, args);
                }
                else {
                    return Promise.resolve();
                }
            });
        }, Promise.resolve());
    }
    /**
     * This allows systems to validate the component being saved.
     * @private
     */
    _validateComponent(entity, component) {
    }
    /**
     * This allows systems to validate the entity being saved.
     * @private
     */
    _validateEntity(entity) {
    }
    /**
     * This allows the systems to validate content before its accepted.
     * The dispatcher saves it to a temporary location so systems can validate it
     * independently. The content could be an extremely large file so we don't want
     * to hold it in memory.
     * @private
     */
    _validateEntityContent(entity, contentId) {
    }
    /**
     * Add an Entity to the datastore. The steps the dispatcher takes when saving an
     * entity are.
     *
     * - Validate the entity with all systems. All systems have to validate to pass.
     * - Save the entity to the datastore.
     * - Notify the systems that an entity has been save to the datastore.
     * @param {object} entity - The entity you want add.
     * @return {Promise}
     */
    addEntityAsync(entity) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                db.collection("entities").insertOne(entity, (error, result) => {
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
     * Adds a component to an entity.
     *
     * The dispatcher does the following when adding a component.
     *
     * - Validate the component with all systems. Needs to be validated on all systems to pass.
     * - Saves the component to the datastore.
     * - Notifies the systems that a component has been added.
     * @param {object} entity - The entity of the component being added.
     * @param {object} component - The component being added.
     */
    addComponentAsync(entity, component) {
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                component.entity_id = mongodb_1.default.ObjectID(entity._id);
                db.collection("components").insertOne(component, (error, result) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
            }).then((results) => {
                return this._notifySystems("entityComponentAddedAsync", [entity, component]).then(() => {
                    return results;
                });
            });
        });
    }
    /**
     * Add a service for systems to use. Services could be HTTP services,
     * or governance that needs to be shared acrossed systems.
     * @param {string} name - The name by which the systems will request the service.
     * @param {object} service - The service.
     * @return {Promise}
     */
    addServiceAsync(name, service) {
        this.services[name] = service;
    }
    /**
     * Add a system to the dispatcher. The systems are really where the work
     * is done. They listen to the life-cycle of the entity and react based
     * on the composition of components.
     *
     * For example an Image Thumbnail System will look to see if the entity has the
     * component of image
     * #### Required System Methods
     * - getGuid()
     * - getName()
     *
     * #### Optional System Methods
     *  - activatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - disposeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - deactivatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - entityAddedAsync(entity: {_id: string})
     *  - entityUpdatedAsync(oldEntity: any, newEntity: any)
     *  - entityRemovedAsync(entity: {_id: string})
     *  - entityContentUpdatedAsync(oldContentId: string, newContentId: string)
     *  - entityComponentAddedAsync(entity: {_id: string}, component: any)
     *  - entityComponentUpdatedAsync(entity: {_id: string}, oldComponent: any, newComponent: any)
     *  - entityComponentRemovedAsync(entity: {_id: string}, component: any)
     *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - validateEntityAsync(entity: {_id: string})
     *  - validateComponentAsync(component: {_id: string})
     *  - validateEntityContentAsync(entity: {_id: string})
     * @param {ISystem} system - The system to add.
     * @return {Promise} - An undefined Promise.
     */
    addSystemAsync(system) {
        this.systems.push(system);
    }
    /**
     * Gets the component by the id provided.
     * @param {string} componentId - The id of the component.
     * @return {Promise<Array>}
     */
    getComponentAsync(componentId) {
        return this._getDatabaseAsync().then((db) => {
            var id = mongodb_1.default.ObjectID(componentId);
            return new Promise((resolve, reject) => {
                db.collection("components").findOne({
                    _id: id
                }, function (error, component) {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(component);
                    }
                });
            });
        });
    }
    /**
     * Get the components of an entity by the entity.
     * @param {object} entity - The entity of the components.
     * @return {Promise<Array>}
     */
    getComponentsByEntityAsync(entity) {
        return this._getDatabaseAsync().then((db) => {
            var entityId = mongodb_1.default.ObjectID(entity._id);
            return new Promise((resolve, reject) => {
                db.collection("components").find({
                    entity_id: entityId
                }, function (error, components) {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(components);
                    }
                });
            });
        });
    }
    /**
     * Get the Components on the entity provided matching the type provided.
     * @param {object} entity - The entity of the needed components.
     * @param {string} type - The type of the component needed.
     */
    getComponentsByTypeAsync(entity, type) {
        return this._getDatabaseAsync().then((db) => {
            var entityId = mongodb_1.default.ObjectID(entity._id);
            return new Promise((resolve, reject) => {
                db.collection("components").find({
                    entity_id: entityId,
                    type: type
                }, function (error, components) {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(components);
                    }
                });
            });
        });
    }
    /**
     * Get an entity by its id.
     * @param {string} entityId - The id of the desired entity.
     * @return {Promise<Entity>} - A Promise resolved with the entity or null.
     */
    getEntityByIdAsync(entityId) {
        return this._getDatabaseAsync().then((db) => {
            var id = mongodb_1.default.ObjectID(entityId);
            return new Promise((resolve, reject) => {
                db.collection("entities").findOne({
                    entity_id: id
                }, function (error, entity) {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(entity);
                    }
                });
            });
        });
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
        return this._getDatabaseAsync().then((db) => {
            return new Promise((resolve, reject) => {
                var id = mongodb_1.default.ObjectID(component._id);
                db.collection("components").deleteOne({
                    _id: id
                }, (error, results) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(results);
                    }
                });
            });
        }).then((results) => {
            return this.getEntityByIdAsync(component.entity_id).then((entity) => {
                return this._notifySystems("entityComponentRemovedAsync", [entity, component]);
            }).then(() => {
                return Promise.resolve(results);
            });
        });
    }
    /**
     * Removes an entity, and its associated content. When the content is
     * removed it runs it through all the life cycles of content being removed.
     * It also removes all the components from the entity, this will also trigger
     * life cycle calls to the systems.
     * @param {object} entity - The entity to be removed.
     * @returns {Promise<undefined>}
     */
    removeEntityAsync(entity) {
    }
    /**
     * Removes a service by its name.
     * @param {string} name - The name of the service to be removed.
     * @returns {Promise<undefined>}
     */
    removeServiceAsync(name) {
    }
    /**
     * Removes a system.
     * @param {system} - The system to be removed.
     * @returns {Promise<undefined>} - Resolves when the system is disposed.
     */
    removeSystemAsync(system) {
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