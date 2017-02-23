import { ISystem, IGridFs, IObjectID, ILogger, IMongo, IMongoDb, IMongoClient, IMongoCollection, IMongoFactory } from "./interfaces";
import * as Grid from "gridfs-stream";
import * as fs from "fs";
import * as uuid from "node-uuid";
import MongoDbIterator from "./MongoDbIterator";
import NullableLogger from "./NullableLogger";

const nullableLogger = new NullableLogger();
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
export default class ClarityTransactionDispatcher {
    private mongodb: IMongo;
    private mongoFactory: IMongoFactory;
    private MongoClient: IMongoClient;
    private ObjectID: IObjectID;
    private databaseUrl: string;
    private services: { [key: string]: any };
    private systems: Array<ISystem>;

    /**
     * Create a Dispatcher.
     * @constructor
     */
    constructor(config: { mongoFactory: IMongoFactory; databaseUrl: string }) {
        this.mongoFactory = config.mongoFactory;
        this.mongodb = this.mongoFactory.createMongodb();
        this.MongoClient = this.mongodb.MongoClient;
        this.ObjectID = this.mongodb.ObjectID;
        this.databaseUrl = config.databaseUrl;
        this.systems = [];
        this.services = {};
    }

    /**
     * Add an item to a collection.
     * @private
     */
    private _addItemToCollectionAsync(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {

            return new Promise((resolve, reject) => {

                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        collection.insertOne(item, (error, result) => {
                            if (error != null) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        });
                    }
                })

            });
        });
    }

    /** 
     * Find one in a collection.
     * @private
     */
    private _findOneAsync(collectionName: string, filter: any) {
        return this._getDatabaseAsync().then((db: any) => {
            return new Promise((resolve, reject) => {

                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        collection.findOne(filter, function (error, item) {
                            if (error != null) {
                                reject(error);
                            } else {
                                resolve(item);
                            }
                        });
                    }
                })

            });

        });
    }

    /** 
    * Find many in a collection.
    * @private
    */
    private _findAsync(collectionName: string, filter: any) {
        return this._getDatabaseAsync().then((db: any) => {
            return new Promise((resolve, reject) => {

                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        collection.find(filter).toArray((error, items) => {
                            if (error != null) {
                                reject(error);
                            } else {
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
    private _getDatabaseAsync() {
        return new Promise((resolve, reject) => {
            this.MongoClient.connect(this.databaseUrl, (error, db) => {
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
    private _getGridFsAsync() {
        return this._getDatabaseAsync().then((db: any) => {
            return this.mongoFactory.createGridFs(db, this.mongodb);
        });
    }

    /**
     * Get the logger.
     * @private
     */
    private _getLogger() {
        return <ILogger>this.services["logger"] || nullableLogger;
    }

    /**
     * Invoke a method on any object and make sure a promise is the returned value.
     * @private
     */
    private _invokeMethodAsync(obj: any, methodName: string, args: Array<any>) {
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
    private _notifySystemsAsync(methodName: string, args: Array<any>) {
        return this.systems.reduce((promise, system) => {

            return promise.then(() => {

                try {
                    return this._invokeMethodAsync(system, methodName, args);
                } catch (error) {
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
    private _notifySystemsWithRecoveryAsync(methodName: string, args: Array<any>) {
        return this.systems.reduce((promise, system) => {

            return promise.then(() => {

                try {
                    return this._invokeMethodAsync(system, methodName, args);
                } catch (error) {
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
    private _removeEntityContentAsync(contentId: string) {
        return this._getGridFsAsync().then((gfs: IGridFs) => {
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
            return resolvedPromise;
        });
    }

    /**
     * Remove and item from a collection
     * @private
     * @returns {Promise<undefined>}
     */
    private _removeItemfromCollection(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {

            return new Promise((resolve, reject) => {

                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        collection.deleteOne({
                            _id: this.ObjectID(item._id)
                        }, (error, result) => {

                            if (error != null) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        });
                    }
                })

            });
        });
    }

    /**
     * Update an item in a collection.
     * @private
     * @returns {Promise<undefined>}
     */
    private _updateItemInCollection(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {

            return new Promise((resolve, reject) => {

                db.collection(collectionName, (err, collection) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        collection.update({
                            _id: this.ObjectID(item._id)
                        }, (error, result) => {

                            if (error != null) {
                                reject(error);
                            } else {
                                resolve(result);
                            }

                        });
                    }
                });

            });
        });
    }

    /**
     * This allows systems to validate the component being saved.
     * @private
     */
    private _validateComponentAsync(entity: { _id: string }, component: { _id: string, type: string, entity_id: string }) {
        return this._notifySystemsAsync("validateComponentAsync", [entity, component]);
    }

    /**
     * This allows systems to validate the entity being saved.
     * @private
     */
    private _validateEntityAsync(entity: { _id: string }) {
        return this._notifySystemsAsync("validateEntityAsync", [entity]);
    }

    /**
     * This allows the systems to validate content before its accepted.
     * The dispatcher saves it to a temporary location so systems can validate it
     * independently. The content could be an extremely large file so we don't want 
     * to hold it in memory.
     * @private
     */
    private _validateEntityContentAsync(entity: { _id: string }, newContentId: string) {
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
    addComponentAsync(entity: { _id: string }, component: { type: string, entity_id: string }) {
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
    addServiceAsync(name: string, service: any) {
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
    addSystemAsync(system: ISystem) {
        this.systems.push(system);
        return this._invokeMethodAsync(system, "activatedAsync", []);
    }

    /**
     * Deactivates a system and removes it from the systems being notified. To activate again use addSystemAsync.
     * Think of this like a pause. The dispatcher calls deactivatedAsync on the system being removed.
     * @param {ISystem} system - The system to be deactivate.
     * @returns {Promise<undefined>} - Resolves when the system is deactivated.
     */
    deactivateSystemAsync(system: ISystem) {
        var deactivatedPromise;
        var index = this.systems.indexOf(system);

        if (index === -1) {
            return Promise.reject(new Error("Couldn't find system to be deactivated."));
        } else {

            this.systems.splice(index, 1);

            try {
                return deactivatedPromise = this._invokeMethodAsync(system, "deactivatedAsync", []).catch(() => {
                    return resolvedPromise;
                })
            } catch (e) {
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
    disposeSystemAsync(system: ISystem) {
        var disposedPromise;
        var index = this.systems.indexOf(system);

        if (index === -1) {
            return Promise.reject(new Error("Couldn't find system to be disposed."));
        } else {

            this.systems.splice(index, 1);

            try {
                return disposedPromise = this._invokeMethodAsync(system, "disposeAsync", []).catch(() => {
                    return resolvedPromise;
                })
            } catch (e) {
                return resolvedPromise;
            }
        }
    }

    /**
     * Gets the component by the id provided.
     * @param {string} componentId - The id of the component.
     * @return {Promise<Array>}
     */
    getComponentAsync(componentId: string) {
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
    getComponentsByEntityAsync(entity: { _id: string }) {
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
    getComponentsByEntityAndTypeAsync(entity: { _id: string }, type: string) {
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
    getEntityByIdAsync(entityId: string) {
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
    getEntityContentStreamByEntityAsync(entity: { _id: string, content_id: string }) {
        return this._getGridFsAsync().then((gfs: any) => {
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
    getEntityContentStreamByContentIdAsync(contentId: string) {
        return this._getGridFsAsync().then((gfs: any) => {
            var id = this.ObjectID(contentId);
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
            collectionName: ENTITIES_COLLECTION,
            MongoClient: this.MongoClient
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
        return this._removeItemfromCollection(component, COMPONENTS_COLLECTION).then(() => {
            return this.getEntityByIdAsync(component.entity_id);
        }).then((entity) => {
            return this._notifySystemsWithRecoveryAsync("entityComponentRemovedAsync", [entity, component]);
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
    removeEntityAsync(entity: { _id: string, content_id: string }) {
        return this.getComponentsByEntityAsync(entity).then((components: Array<any>) => {

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
        });
    }

    /**
     * Removes a service by its name. The dispatcher will notify the systems that this service is being 
     * removed.
     * @param {string} name - The name of the service to be removed.
     * @returns {undefined}
     */
    removeServiceAsync(name: string) {
        if (this.services[name]) {
            delete this.services[name];
            return this._notifySystemsWithRecoveryAsync("serviceRemovedAsync", [name, this.services[name]]);
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
    updateEntityAsync(entity: { _id: string }) {
        return this._validateEntityAsync(entity).then(() => {
            return this._findOneAsync(ENTITIES_COLLECTION, {
                _id: this.ObjectID(entity._id)
            });
        }).then((oldEntity) => {
            return this._updateItemInCollection(entity, ENTITIES_COLLECTION).then(() => {
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
    updateEntityContentByStreamAsync(entity: { _id: string }, stream: NodeJS.ReadableStream) {
        var newContentId = uuid.v4();

        // We need to pause this until we are ready to pipe to the gridfs.
        stream.pause();
        this._getGridFsAsync().then((gfs: IGridFs) => {
            var writeStream = gfs.createWriteStream({
                _id: newContentId
            });
            stream.pipe(writeStream);
            stream.resume();
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
    updateComponentAsync(entity: { _id: string }, component: { _id: string, type: string, entity_id: string }) {
        return this._validateComponentAsync(entity, component).then(() => {
            return this._findOneAsync(COMPONENTS_COLLECTION, {
                _id: this.ObjectID(component._id)
            });
        }).then((oldComponent) => {
            return this._updateItemInCollection(component, COMPONENTS_COLLECTION).then(() => {
                return oldComponent;
            });
        }).then((oldComponent) => {
            return this._notifySystemsWithRecoveryAsync("componentUpdatedAsync", [oldComponent, component]);
        });
    }

}