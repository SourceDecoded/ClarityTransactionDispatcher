import ClarityTransactionDispatcher from "./ClarityTransactionDispatcher";
import * as stream from "stream";

export interface IMongoFactory {
    createGridFs: (db: IMongoDb, mongo: IMongo) => IGridFs;
    createMongodb: () => IMongo;
}

export interface IMongoCursor {
    toArray: (callback: (err, results: Array<any>) => void) => void;
}

export interface IGridFs {
    createReadStream: (filter: {
        _id?: any;
        filename?: any;
    }) => stream.Readable;

    createWriteStream: (filter: {
        _id?: any;
        filename?: any;
    }) => stream.Writable;
    remove: (filter: { _id: string; }, callback: (err) => void) => void;
}

export interface IObjectIDInstance {
    equals: (id: IObjectIDInstance) => boolean;
    toHexString: () => string;
    getTimestamp: () => Date;
}

export interface IObjectID {
    (id?: string): IObjectIDInstance;
    createFromTime: (time: number) => IObjectIDInstance;
    createFromHexString: (hexString: string) => IObjectIDInstance;
    isValid: () => boolean;
}

export interface IMongoCollection {
    insertOne: (document: any, callback: (error, result: any) => void) => void;
    deleteOne: (filter: any, callback: (error, result: any) => void) => void;
    update: (filter: any, callback: (error, result: any) => void) => void;
    find: (filter: any, callback: (error, result: any) => void) => void;
    findOne: (filter: any, callback: (error, result: any) => void) => void;
}

export interface IMongoDb {
    collection: (name: string, callback: (error, MongoCollection: IMongoCollection) => void) => void;
}

export interface IMongoClient {
    connect: (connectionString: string, callback: (err, db: IMongoDb) => void) => void;
}


export interface IMongo {
    ObjectID: IObjectID;
    MongoClient: IMongoClient;
}

/**
 * Describes the possible and require life-cycle hooks available
 * to systems registering with ClarityTransactionDispatcher.
 */
export interface ISystem {
    /** 
    * Returns a guid that is unique to this system. This is used to
    * serialize the systems into a state.json file. The file will be 
    * used on booting up the dispatcher. The state.json file will know
    * whether or not the system has been initialized. This is just one 
    * possibility of many.
    * @return {string} The GUID of the system.
    */
    getGuid();
    /** 
     * This will be the name of the system displayed on any interface
     * interested.
     * @return {string} The name of the system.
     */
    getName();

    // Optional interfaces.
    activatedAsync?(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    deactivatedAsync?(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    disposeAsync?(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    entityAddedAsync?(entity: { _id: string });
    entityUpdatedAsync?(oldEntity: any, newEntity: any);
    entityRemovedAsync?(entity: { _id: string });
    entityRetrievedAsync?(entity: { _id: string });
    entityContentUpdatedAsync?(oldContentId: string, newContentId: string);
    entityComponentAddedAsync?(entity: { _id: string }, component: any);
    entityComponentUpdatedAsync?(entity: { _id: string }, oldComponent: any, newComponent: any);
    entityComponentRemovedAsync?(entity: { _id: string }, component: any);
    entityComponentRetrievedAsync?(entity: { _id: string }, component: any);
    initializeAsync?(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    serviceRemovedAsync?(name: string, service: any);
    validateEntityAsync?(entity: { _id: string });
    validateComponentAsync?(component: { _id: string });
    validateEntityContentAsync?(entity: { _id: string }, oldContentId: string, newContentId: string);
}

export interface ISystemData {
    _id: string;
    systemGuid: string;
    isInitialized: boolean;
}

export interface ILogger {
    warn(message: string, ...data: any[]): void;
    error(message: string, ...data: any[]): void;
    message(message: string, ...data: any[]): void;
    info(message: string, ...data: any[]): void;
    debug(message: string, ...data: any[]): void;
}