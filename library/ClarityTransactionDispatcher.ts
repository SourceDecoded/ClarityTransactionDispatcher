import { IEntity, IComponent, ISystem, ISystemData, IGridFs, IObjectID, ILogger, IObjectIDInstance, IMongo, IMongoDb, IMongoClient, IMongoCollection, IMongoFactory } from "./interfaces";
import * as Grid from "gridfs-stream";
import * as fs from "fs";
import * as uuid from "node-uuid";
import MongoDbIterator from "./MongoDbIterator";
import NullableLogger from "./NullableLogger";

const nullableLogger = new NullableLogger();
const resolvedPromise = Promise.resolve(null);

const ENTITIES_COLLECTION = "entities";
const COMPONENTS_COLLECTION = "components";
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

    private _addItemToGridFs(stream: NodeJS.ReadableStream): any {
        var newContentId = this.ObjectID();
        stream.pause();

        return this._getGridFsAsync().then((gfs: IGridFs) => {
            return new Promise((resolve, reject) => {
                var writeStream = gfs.createWriteStream({
                    _id: newContentId
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
    private _addItemToCollectionAsync(item: any, collectionName: string) {
        item.updatedDate = new Date();
        item.createdDate = new Date();
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.insertOne(item);
        }).then((result) => {
            item._id = result.insertedId;
            return item;
        });
    }

    private _createEntityByIdAsync(id?) {
        return this._createObjectIdAsync(id).then((objectId) => {
            return {
                _id: objectId
            };
        });
    }

    private _createObjectIdAsync(id) {
        try {
            id = id != null ? this.ObjectID(id) : null
            return Promise.resolve(id);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /** 
     * Find one in a collection.
     * @private
     */
    private _findOneAsync(collectionName: string, filter: any) {
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.findOne(filter);
        });
    }

    /** 
    * Find many in a collection.
    * @private
    */
    private _findAsync(collectionName: string, filter: any) {
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.find(filter).toArray();
        });
    }

    /** 
     * Get count in a collection.
     * @private
     */
    private _getCountAsync(collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {
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
    private _getDatabaseAsync() {
        return this.MongoClient.connect(this.databaseUrl);
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
     * Initialize a system.
     * @private
     */
    private _initializingSystemAsync(system: ISystem) {
        var filter = {
            systemGuid: system.getGuid()
        };

        return this._findOneAsync(SYSTEM_DATA_COLLECTION, filter).then((systemData: ISystemData) => {
            if (systemData == null) {
                var newSystemData = <ISystemData>{
                    systemGuid: system.getGuid(),
                    isInitialized: false
                };

                return this._addItemToCollectionAsync(newSystemData, SYSTEM_DATA_COLLECTION);
            } else {
                return systemData;
            }
        }).then((systemData: ISystemData) => {
            if (!systemData.isInitialized) {
                return this._invokeMethodAsync(system, "initializeAsync", [this]).then(() => {
                    systemData.isInitialized = true;
                    return this._updateItemInCollectionAsync(systemData, SYSTEM_DATA_COLLECTION);
                });
            }
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
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
    private _notifySystemsWithRecoveryAsync(methodName: string, args: Array<any>) {
        return this.systems.reduce((promise, system) => {

            return promise.then(() => {

                try {
                    return this._invokeMethodAsync(system, methodName, args);
                } catch (error) {
                    this.logError(error);
                    throw error;
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
    private _removeItemFromGridFsAsync(id: string) {
        return this._getGridFsAsync().then((gfs: IGridFs) => {
            return new Promise((resolve, reject) => {

                gfs.remove({
                    _id: id
                }, (error) => {
                    if (error != null) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });

            });
        });
    }

    /**
     * Remove and item from a collection
     * @private
     * @returns {Promise<undefined>}
     */
    private _removeItemfromCollection(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {
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
    private _updateItemInCollectionAsync(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.update({
                _id: this.ObjectID(item._id)
            }, item, null);
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
    addComponentAsync(entity: IEntity, component: IComponent) {
        var savedComponent;

        return this._createObjectIdAsync(entity._id).then((entityId) => {
            return this.getEntityByIdAsync(entityId);
        }).then(entity => {
            component.entity_id = entity._id;
            return this.validateComponentAsync(entity, component);
        }).then(() => {
            return this._addItemToCollectionAsync(component, COMPONENTS_COLLECTION);
        }).then(newComponent => {
            savedComponent = newComponent;
            return this._notifySystemsWithRecoveryAsync("entityComponentAddedAsync", [entity, savedComponent]);
        }).then(() => {
            return savedComponent;
        }).catch((error) => {
            this.logError(error);
            throw error;
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
     * @param {NodeJS.ReadableStream} stream - The content of the entity.
     * @param {Array<component>} components - An array of components belonging to the entity.
     * @param {string} entityId - The id that you want to assign to the entity.
     * @return {Promise}
     */
    addEntityAsync(contentStream?: NodeJS.ReadableStream, components?: Array<{ type: string }>, entityId?: string) {
        var contentId;
        var savedComponents = [];
        var entity: IEntity;

        return this._createEntityByIdAsync(entityId).then((newEntity) => {
            entity = newEntity

            if (contentStream == null) {
                return Promise.resolve(null);
            } else {
                return this._addItemToGridFs(contentStream);
            }

        }).then((newContentId) => {
            // Validate the entity, and save the contentId.
            contentId = newContentId;
            return this.validateEntityAsync(entity);
        }).then(() => {
            // Save the entity.
            entity.content_id = contentId;

            return this._addItemToCollectionAsync(entity, ENTITIES_COLLECTION);
        }).then(() => {
            // Validate and save all the components. 
            return components.reduce((promise: Promise<any>, component: any) => {
                component.entity_id = entity._id;

                return this.validateComponentAsync(entity, component).then(() => {
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
                return savedComponents.reduce((promise: Promise<any>, component) => {
                    return this._notifySystemsWithRecoveryAsync("entityComponentAddedAsync", [entity, component]);
                }, resolvedPromise);
            });
        }).then(() => {
            const savedData = {
                entity: entity,
                components: savedComponents
            };

            return savedData;
        }).catch((error) => {
            // Since we save the content first we may have the content saved and not the entity.
            // If we were able to save the entity then the removeEntityAsync will take care of removing the content.
            // Otherwise we need to remove the content manually.

            this.logError(error);

            if (entity != null) {
                this.removeEntityAsync(entity);
            } else {
                if (contentId != null) {
                    this._removeItemFromGridFsAsync(contentId);
                }
            }

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
     *  - entityRetrievedAsync?(entity: { _id: string });
     *  - entityContentUpdatedAsync(oldContentId: string, newContentId: string)
     *  - entityComponentAddedAsync(entity: {_id: string}, component: any)
     *  - entityComponentUpdatedAsync(entity: {_id: string}, oldComponent: any, newComponent: any)
     *  - entityComponentRemovedAsync(entity: {_id: string}, component: any)
     *  - entityComponentRetrievedAsync?(entity: { _id: string }, component: any);
     *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - serviceRemovedAsync(name: string, service: any);
     *  - validateEntityAsync(entity: {_id: string})
     *  - validateComponentAsync(component: {_id: string})
     *  - validateEntityContentAsync(entity: {_id: string}, oldContentId: string, newContentId: string)
     *  - approveComponentRemovalAsync(component:{_id: string; entity_id: string})
     *  - approveEntityRemovalAsync(entity:{_id: string})
     * @param {ISystem} system - The system to add.
     * @return {Promise} - An undefined Promise.
     */
    addSystemAsync(system: ISystem) {
        if (!this.validateSystem(system)) {
            return Promise.reject(new Error("Invalid system: Systems need to have a getName and a getGuid method on them."));
        } else {
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
            }).catch((error) => {
                this.logError(error);
                throw error;
            });
        }
    }

    /**
   * Approves whether an entity can be removed. Systems can deny the ability to remove entities.
   * @param entity {object} - The entity to be removed.
   */
    approveEntityRemovalAsync(entity: IEntity) {
        return this._notifySystemsAsync("approveEntityRemovalAsync", [entity]);
    }

    /**
     * Approves whether a component can be removed. Systems can deny the ability to remove components.
     * @param entity {object} - The entity to be removed.
     */
    approveComponentRemovalAsync(component: IComponent) {
        return this._notifySystemsAsync("approveComponentRemovalAsync", [component]);
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
                return deactivatedPromise = this._invokeMethodAsync(system, "deactivatedAsync", []).then(() => {
                    this.logMessage({
                        type: NOTICE,
                        message: `System "${system.getName()}" was deactivated.`
                    });
                }).catch(() => {
                    return resolvedPromise;
                });
            } catch (e) {
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
    disposeSystemAsync(system: ISystem) {
        var disposedPromise;
        var index = this.systems.indexOf(system);

        if (index === -1) {
            return Promise.reject(new Error("Couldn't find system to be disposed."));
        } else {

            this.systems.splice(index, 1);

            try {
                return disposedPromise = this._invokeMethodAsync(system, "disposeAsync", []).then(() => {
                    this.logMessage({
                        type: NOTICE,
                        message: `System "${system.getName()}" was disposed.`
                    });
                }).catch(() => {
                    return resolvedPromise;
                });
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
    getComponentByIdAsync(componentId: string) {
        return this._createObjectIdAsync(componentId).then(objectId => {
            const filter = { _id: objectId };
            return this._findOneAsync(COMPONENTS_COLLECTION, filter).then(component => {
                return this._notifySystemsWithRecoveryAsync("entityComponentRetrievedAsync", [null, component]).then(() => {
                    return component;
                });
            })
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
    }

    /**
     * Get count for all components in collection.
     */
    getComponentCountAsync() {
        return this._getCountAsync(COMPONENTS_COLLECTION);
    }

    /**
     * Get the components of an entity by the entity.
     * @param {IEntity} entity - The entity of the components.
     * @return {Promise<Array>}
     */
    getComponentsByEntityAsync(entity: IEntity) {
        var retrievedComponents;
        var filter = {
            entity_id: this.ObjectID(entity._id)
        };

        return this._findAsync(COMPONENTS_COLLECTION, filter).then((components: Array<any>) => {
            retrievedComponents = components;
            return retrievedComponents.reduce((promise: Promise<any>, component) => {
                return this._notifySystemsWithRecoveryAsync("entityComponentRetrievedAsync", [entity, component]);
            }, resolvedPromise);
        }).then(() => {
            return retrievedComponents;
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
    }

    /**
     * Get the Components on the entity provided matching the type provided.
     * @param {IEntity} entity - The entity of the needed components.
     * @param {string} type - The type of the component needed.
     */
    getComponentsByEntityAndTypeAsync(entity: { _id: string }, type: string) {
        var retrievedComponents;
        var filter = {
            entity_id: this.ObjectID(entity._id),
            type: type
        };

        return this._findAsync(COMPONENTS_COLLECTION, filter).then((components: Array<any>) => {
            retrievedComponents = components;
            return retrievedComponents.reduce((promise: Promise<any>, component) => {
                return this._notifySystemsWithRecoveryAsync("entityComponentRetrievedAsync", [entity, component]);
            }, resolvedPromise);
        }).then(() => {
            return retrievedComponents;
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
    }


    /**
     * Page through entities using the lastId from a previous query. Use null or undefined to begin at the beginning.
     * @param config {} - The configuration of the query. It takes a lastId, and a pageSize. 
     */
    getEntitiesAsync(config) {
        var lastId = config.lastId;
        var pageSize = config.pageSize < 50 ? config.pageSize : 50;
        var lastUpdatedDate = config.lastUpdatedDate;
        var lastCreatedDate = config.lastCreatedDate;

        var sort = [["_id", 1]];
        var filter = <any>{};

        if (lastId != null) {
            filter._id = {
                $gt: this.ObjectID(lastId)
            };
        }

        if (lastCreatedDate != null) {
            filter.createdDate = {
                $gt: lastCreatedDate
            };
            sort.push(["createdDate", 1]);
        }

        if (lastUpdatedDate != null) {
            filter.updatedDate = {
                $gt: lastUpdatedDate
            };
            sort.push(["updatedDate", 1]);
        }

        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(ENTITIES_COLLECTION).find(filter).limit(parseInt(pageSize, 10)).sort(sort).toArray();
        });
    }

    /**
     * Get an entity by its id.
     * @param {string} entityId - The id of the desired entity.
     * @return {Promise<Entity>} - A Promise resolved with the entity or null.
     */
    getEntityByIdAsync(entityId: string) {
        return this._createEntityByIdAsync(entityId).then(filter => {
            return this._findOneAsync(ENTITIES_COLLECTION, filter);
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
     * Get a stream of the content of the entity.
     * @param {IEntity} entity - The entity of the content needed.
     * @returns {Promise<stream>} - Node read stream.
     */
    getEntityContentStreamByEntityAsync(entity: IEntity) {
        return this._getGridFsAsync().then((gfs: any) => {
            return gfs.createReadStream({
                _id: this.ObjectID(entity.content_id)
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
            return gfs.createReadStream({
                _id: this.ObjectID(contentId)
            });
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
    getService(name: string) {
        return this.services[name] || null;
    }

    /**
     * Notifies the systems about an error.
     * @param error {object} - The error to be sent to the systems.
     * @returns {undefined}
     */
    logError(error: { type?: string; message?: string; }) {
        this._notifySystemsAsync("logError", [error]);
    }

    /**
     * Notifies the systems about an error.
     * @param message {object} - The message to be sent to the systems.
     * @returns {undefined}
     */
    logMessage(message: { type?: string; message?: string; }) {
        this._notifySystemsAsync("logMessage", [message]);
    }

    /**
     * Notifies the systems about a warning.
     * @param warning {object} - The warning to be sent to the systems.
     * @returns {undefined}
     */
    logWarning(warning: { type?: string; message?: string; }) {
        this._notifySystemsAsync("logWarning", [warning]);
    }

    /**
     * Remove a component from an entity.
     * @param {object} component - The component to be removed.
     * @returns {Promise<undefined>}
     */
    removeComponentAsync(component: IComponent) {
        return this.approveComponentRemovalAsync(component).then(() => {
            return this._removeItemfromCollection(component, COMPONENTS_COLLECTION).then(() => {
                return this.getEntityByIdAsync(component.entity_id);
            });
        }).then((entity) => {
            return this._notifySystemsWithRecoveryAsync("entityComponentRemovedAsync", [entity, component]);
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
    }

    /**
     * Removes an entity, and its associated content. The dispatcher does the following to remove an entity.
     * 
     * - Removes all of the components on the entity notifying the systems that the components have been removed.
     * - Removes the content and notifies the systems.
     * - Removes the entity to be removed and notifies the systems the entity has been removed.
     * @param {IEntity} entity - The entity to be removed.
     * @returns {Promise<undefined>} 
     */
    removeEntityAsync(entity: IEntity) {
        return this.approveEntityRemovalAsync(entity).then(() => {
            return this.getComponentsByEntityAsync(entity).then((components: Array<any>) => {

                return components.reduce((promise, component) => {

                    return promise.then(() => {
                        // We don't need to approve these to be removed because we already got approved to remove the entity.
                        // And the components are just an extension of the entity.
                        return this.removeComponentAsync(component);
                    }).catch((error) => {
                        return resolvedPromise;
                    });

                }, resolvedPromise);

            });
        }).then(() => {
            return this.removeEntityContentAsync(entity);
        }).then(() => {
            return this._removeItemfromCollection(entity, "entities");
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityRemovedAsync", [entity]);
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
    }

    /**
     * Removes the content of an entity.
     * @param {IEntity} entity - The entity of the content to be removed.
     */
    removeEntityContentAsync(entity: IEntity) {
        var contentId = entity.content_id;

        if (contentId == null) {
            return resolvedPromise;
        }

        return this._removeItemFromGridFsAsync(contentId).then(() => {
            entity.content_id = null;
            return this.updateEntityAsync(entity);
        }).then(() => {
            return this._notifySystemsWithRecoveryAsync("entityContentRemovedAsync", [null, contentId]);
        }).then(() => {
            return this.getEntityByIdAsync(entity._id);
        }).catch((error) => {
            this.logError(error);
            throw error;
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
        } else {
            var error = Error("Couldn't find service to be removed.");
            this.logError(error);
            return Promise.reject(error);
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
    updateEntityAsync(entity: IEntity) {
        return this.validateEntityAsync(entity).then(() => {
            return this._findOneAsync(ENTITIES_COLLECTION, {
                _id: this.ObjectID(entity._id)
            });
        }).then((oldEntity: any) => {
            entity._id = oldEntity._id;
            (<any>entity).updatedDate = new Date();

            return this._updateItemInCollectionAsync(entity, ENTITIES_COLLECTION).then(() => {
                return oldEntity;
            });
        }).then((oldEntity) => {
            return this._notifySystemsWithRecoveryAsync("entityUpdatedAsync", [oldEntity, entity]);
        }).then(() => {
            return entity;
        }).catch((error) => {
            this.logError(error);
            throw error;
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
    updateEntityContentByStreamAsync(entity: IEntity, stream: NodeJS.ReadableStream) {
        var contentId = null;
        var updatedEntity = null;
        var oldContentId = entity.content_id;

        return this._addItemToGridFs(stream).then((id: string) => {
            contentId = id;
            return this.validateEntityContentAsync(entity, id);
        }).then(() => {
            entity.content_id = this.ObjectID(contentId);
            return this.updateEntityAsync(entity);
        }).then((entity) => {
            updatedEntity = entity;
            return this._removeItemFromGridFsAsync(oldContentId);
        }).then(() => {
            return updatedEntity;
        }).catch((error) => {
            if (contentId != null) {
                entity.content_id = oldContentId;
                return this._updateItemInCollectionAsync(entity, ENTITIES_COLLECTION).catch(() => {
                    this.logError(error);
                });
            }
            throw error;
        });
    }

    /**
     * Update a component. The dispatcher will perform the following actions when 
     * updating the component of an entity.
     * 
     * - Validate the component. All interested systems need to validate to pass.
     * - Save the component to the datastore.
     * - Notify the systems that the component was updated.
     * 
     * @param {object} component - The component to be updated.
     */
    updateComponentAsync(component: IComponent) {
        let oldEntity;

        return this._createObjectIdAsync(component.entity_id).then(entityId => {
            return this.getEntityByIdAsync(entityId);
        }).then((entity) => {
            oldEntity = entity;
            return this.validateComponentAsync(entity, component);
        }).then(() => {
            return this.getComponentByIdAsync(component._id);
        }).then((oldComponent: any) => {
            component._id = oldComponent._id;
            (<any>component).updatedDate = new Date();

            return this._updateItemInCollectionAsync(component, COMPONENTS_COLLECTION).then(() => {
                return oldComponent;
            });
        }).then((oldComponent) => {
            return this._notifySystemsWithRecoveryAsync("entityComponentUpdatedAsync", [oldEntity, oldComponent, component]);
        }).then(() => {
            return this.updateEntityAsync(oldEntity);
        }).then(() => {
            return component;
        }).catch((error) => {
            this.logError(error);
            throw error;
        });
    }

    /**
     * This allows systems to validate the component being saved.
     */
    validateComponentAsync(entity: IEntity, component: IComponent) {
        return this._notifySystemsAsync("validateComponentAsync", [entity, component]);
    }

    /**
     * This allows systems to validate the entity being saved.
     */
    validateEntityAsync(entity: IEntity) {
        return this._notifySystemsAsync("validateEntityAsync", [entity]);
    }

    /**
     * This allows the systems to validate content before its accepted.
     * The dispatcher saves it to a temporary location so systems can validate it
     * independently. The content could be an extremely large file so we don't want 
     * to hold it in memory.
     * @param {IEntity} entity - The entity the content belongs to.
     * @param {string} newContentId - The id of the new content.
     */
    validateEntityContentAsync(entity: IEntity, newContentId: string) {
        return this._notifySystemsAsync("validateEntityContentAsync", [entity, newContentId]);
    }

    /**
     * Ensures the system has the required methods.
     * @param {ISystem} system - The System to be validated.
     */
    validateSystem(system: ISystem) {
        if (typeof system.getGuid !== "function" ||
            typeof system.getName !== "function") {
            return false;
        }

        return true;
    }
}