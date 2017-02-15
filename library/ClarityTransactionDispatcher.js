"use strict";
const mongodb_1 = require("mongodb");
const Grid = require("gridfs-stream");
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
     * @private
     * Get a mongodb. Remember to close the db connection when finished.
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
     * @returns {Promise<gridfs>}
     */
    _getGridFsAsync() {
        return this._getDatabaseAsync().then((db) => {
            return Grid(db, mongodb_1.default);
        });
    }
    /**
     * Add an Entity to the datastore. This will record
     * a transaction as well as maintain the current
     * state of the entity.
     * @param {object} entity - The entity you want add.
     * @return {Promise}
     */
    addEntityAsync(entity) {
    }
    /**
     * Adds a component to an entity.
     * @param {object} entity - The entity of the component being added.
     * @param {object} component - The component being added.
     */
    addComponentAsync(entity, component) {
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
     * #### Required
     * - getGuid()
     * - getName()
     *
     * #### Optional
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
     * @param {ISystem} system - The system to add.
     * @return {Promise} - An undefined Promise.
     */
    addSystemAsync(system) {
        this.systems.push(system);
    }
    /**
     * Gets the component by the id provided.
     * @param {string} id - The id of the component.
     * @return {Promise<Array>}
     */
    getComponent(id) {
    }
    /**
     * Get the components of an entity by the entity.
     * @param {object} entity - The entity of the components.
     * @return {Promise<Array>}
     */
    getComponentsByEntityAsync(entity) {
    }
    /**
     * Get the components of an entity by the entity.
     * @param {object} id - The entity's id of the components.
     * @return {Promise<Array>}
     */
    getComponentsByEntityIdAsync(id) {
    }
    /**
     * Get an entity by its id.
     * @param {string} id - The id of the desired entity.
     * @return {Promise<Entity>} - A Promise resolved with the entity or null.
     */
    getEntityByIdAsync(id) {
    }
    /**
     * Get a stream of the content of the entity.
     * @param {object} entity - The entity you want to get the content of.
     * @returns {stream} - Node read stream.
     */
    getEntityContentStream(entity) {
    }
    /**
     * Get a stream of the content of the entity by its id.
     * @param {string} id - The id of the entity you want to get the content of.
     * @returns {NodeJS.ReadableStream} - Node read stream.
     */
    getEntityContentStreamByEntityId(id) {
    }
    /**
     * Get a range of entities.
     * @param {number} skip - The amount of entities you want to skip.
     * @param {number} take - The amount of entities you want to take.
     * @return {Promise<Array<object>>} - The range of entities.
     */
    getEntitiesAsync(skip, take) {
    }
    /**
     * Get a service by the name given.
     * @param {string} name - The name of the desired service.
     * @returns {object} - Null or the desired service.
     */
    getService(name) {
    }
    /**
     * Remove a component from an entity.
     * @param {object} component - The component to be removed.
     * @returns {Promise<undefined>}
     */
    removeComponentAsync(component) {
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
     * @returns {undefined}
     */
    removeService(name) {
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