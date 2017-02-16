import { ISystem, ILogger } from "./interfaces";
import mongo, { MongoClient } from "mongodb";
import * as Grid from "gridfs-stream";
import * as fs from "fs";
import MongoDbIterator from "./MongoDbIterator";
import NullableLogger from "./NullableLogger";

var nullableLogger = new NullableLogger();

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
export default class ClarityTransactionDispatcher {
    private MongoClient: MongoClient;
    private databaseUrl: string;
    private services: { [key: string]: any };
    private systems: Array<ISystem>;

    /**
     * Create a Dispatcher.
     * @constructor
     */
    constructor(config: { MongoClient: MongoClient; databaseUrl: string }) {
        this.MongoClient = config.MongoClient;
        this.databaseUrl = config.databaseUrl;
    }

    /**
     * Add an item to a collection.
     */
    _addItemToCollectionAsync(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {

            return new Promise((resolve, reject) => {

                db.collection("components").insertOne(item, (error, result) => {

                    if (error != null) {
                        reject(error);
                    } else {
                        resolve(result);
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
            MongoClient.connect(this.databaseUrl, (error, db) => {
                if (error != null) {
                    reject(error);
                } else {
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
            return Grid(db, mongo);
        });
    }

    /**
     * Get the logger.
     */
    _getLogger() {
        return <ILogger>this.services["logger"] || nullableLogger;
    }

    /**
     * Notify the systems of a life cycle by its method name.
     * @private
     * @returns {Promise<undefined>}
     */
    _notifySystemsAsync(methodName: string, args: Array<any>) {
        return this.systems.reduce((promise, system) => {

            return promise.then(() => {
                if (typeof system[methodName] === "function") {
                    try {
                        return system[methodName].apply(system, args);
                    } catch (error) {

                        this._getLogger().error(error.message, error);

                        return Promise.resolve();
                    }
                } else {
                    return Promise.resolve();
                }
            });

        }, Promise.resolve());
    }

    /**
     * Remove the content of an entity.
     */
    _removeEntityContentAsync(contentId: string) {
        return this._getGridFsAsync().then((gfs) => {
            return new Promise((resolve, reject) => {

                gfs.remove({
                    _id: contentId
                }, function (error) {
                    if (error != null) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });

            });
        }).catch((error) => {
            this._getLogger().error(error.message, error);

            // It may not have been able to find the file.
            return Promise.resolve();
        });
    }

    /**
     * Remove and item from a collection
     * @private
     * @returns {Promise<undefined>}
     */
    _removeItemfromCollection(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {

            return new Promise((resolve, reject) => {

                db.collection("components").deleteOne({
                    _id: mongo.ObjectID(item._id)
                }, item, (error, result) => {

                    if (error != null) {
                        reject(error);
                    } else {
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
    _updateItemInCollection(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {

            return new Promise((resolve, reject) => {

                db.collection("components").update({
                    _id: mongo.ObjectID(item._id)
                }, item, (error, result) => {

                    if (error != null) {
                        reject(error);
                    } else {
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
    _validateComponentAsync(entity: { _id: string }, component: { type: string, entity_id: string }) {
        return this._notifySystemsAsync("validateComponentAsync", [entity, component]);
    }

    /**
     * This allows systems to validate the entity being saved.
     * @private
     */
    _validateEntityAsync(entity: { _id: string }) {
        return this._notifySystemsAsync("validateEntityAsync", [entity]);
    }

    /**
     * This allows the systems to validate content before its accepted.
     * The dispatcher saves it to a temporary location so systems can validate it
     * independently. The content could be an extremely large file so we don't want 
     * to hold it in memory.
     * @private
     */
    _validateEntityContentAsync(entity: { _id: string }, newContentId: string) {
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
    addEntityAsync(entity: any) {

        return this._validateEntityAsync(entity).then(() => {
            return this._addItemToCollectionAsync(entity, "entities");
        }).then(() => {
            return this._notifySystemsAsync("entityAddedAsync", [entity]);
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
    addComponentAsync(entity: { _id: string }, component: { type: string, entity_id: string }) {
        component.entity_id = entity._id;

        return this._validateEntityAsync(entity).then(() => {
            return this._addItemToCollectionAsync(entity, "components");
        }).then(() => {
            return this._notifySystemsAsync("entityComponentAddedAsync", [entity, component]);
        });

    }

    /**
     * Add a service for systems to use. Services could be HTTP services,
     * or governance that needs to be shared acrossed systems.
     * @param {string} name - The name by which the systems will request the service.
     * @param {object} service - The service.
     * @return {Promise<undefined>}
     */
    addServiceAsync(name: string, service: any) {
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
    addSystemAsync(system: ISystem) {
        this.systems.push(system);
    }

    /**
     * Gets the component by the id provided.
     * @param {string} componentId - The id of the component.
     * @return {Promise<Array>}
     */
    getComponentAsync(componentId: string) {
        return this._getDatabaseAsync().then((db: any) => {

            var id = mongo.ObjectID(componentId);

            return new Promise((resolve, reject) => {

                db.collection("components").findOne({
                    _id: id
                }, function (error, component) {
                    if (error != null) {
                        reject(error);
                    } else {
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
    getComponentsByEntityAsync(entity: { _id: string }) {
        return this._getDatabaseAsync().then((db: any) => {

            var entityId = mongo.ObjectID(entity._id);

            return new Promise((resolve, reject) => {

                db.collection("components").find({
                    entity_id: entityId
                }, function (error, components) {
                    if (error != null) {
                        reject(error);
                    } else {
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
    getComponentsByTypeAsync(entity: { _id: string }, type: string) {
        return this._getDatabaseAsync().then((db: any) => {

            var entityId = mongo.ObjectID(entity._id);

            return new Promise((resolve, reject) => {

                db.collection("components").find({
                    entity_id: entityId,
                    type: type
                }, function (error, components) {
                    if (error != null) {
                        reject(error);
                    } else {
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
    getEntityByIdAsync(entityId: string) {
        return this._getDatabaseAsync().then((db: any) => {

            var id = mongo.ObjectID(entityId);

            return new Promise((resolve, reject) => {

                db.collection("entities").findOne({
                    entity_id: id
                }, function (error, entity) {
                    if (error != null) {
                        reject(error);
                    } else {
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
    getEntityContentStreamByEntityAsync(entity: { _id: string, content_id: string }) {
        return this._getGridFsAsync().then((gfs: any) => {
            var id = mongo.ObjectId(entity.content_id);
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
    getEntityContentStreamByContentIdAsync(contentId: string) {
        return this._getGridFsAsync().then((gfs: any) => {

            var id = mongo.ObjectId(contentId);
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
        return new MongoDbIterator({
            databaseUrl: this.databaseUrl,
            collectionName: "enities",
            MongoClient: MongoClient
        });
    }

    /**
     * Get a service by the name given.
     * @param {string} name - The name of the desired service.
     * @returns {object} - Null or the desired service.
     */
    getService(name: string) {
        return this.services[name] || null;
    }

    /**
     * Remove a component from an entity.
     * @param {object} component - The component to be removed.
     * @returns {Promise<undefined>}
     */
    removeComponentAsync(component: { _id: string, type: string, entity_id: string }) {
        return this._removeItemfromCollection(component, "components").then(() => {
            return this.getEntityByIdAsync(component.entity_id);
        }).then((entity) => {
            return this._notifySystemsAsync("entityComponentRemovedAsync", [entity, component]);
        });
    }

    /**
     * Removes the content of an entity.
     */
    removeEntityContentAsync(entity: { _id: string, content_id: string }) {
        var contentId = entity.content_id;

        this._removeEntityContentAsync(contentId).then(() => {
            entity.content_id = null;
            return this.updateEntityAsync(entity);
        }).then(() => {
            return this._notifySystemsAsync("entityContentUpdatedAsync", [null, contentId]);
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
    removeEntityAsync(entity: { _id: string, content_id: string }) {
        return this.getComponentsByEntityAsync(entity).then((components: Array<any>) => {

            return components.reduce((promise, component) => {

                return promise.then(() => {
                    return this.removeComponentAsync(component);
                }).catch((error) => {
                    return Promise.resolve();
                });

            }, Promise.resolve());

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
    removeServiceAsync(name: string) {
        delete this.services[name];
    }

    /**
     * Removes a system.
     * @param {system} - The system to be removed.
     * @returns {Promise<undefined>} - Resolves when the system is disposed.
     */
    removeSystemAsync(system: ISystem) {

    }

    /**
     * Updated an entity.
     * @param {object} entity - The updated entity.
     * @returns {Promise<undefined>} - Resolves when the entity is saved.
     */
    updateEntityAsync(entity: { _id: string }) {

    }

    /**
     * Update an entity's content.
     * @param {object} entity - The entity whos content is to be update.
     * @param {NodeJS.WritableStream}  - The stream to save to the content of the entity.
     * @return {undefined}
     */
    updateEntityContentByStream(entity: { _id: string }, stream: NodeJS.WritableStream) {

    }

    /**
     * Update a component.
     * @param {object} component - The component to be updated.
     */
    updateComponentAsync(component: { _id: string, type: string }) {

    }

}