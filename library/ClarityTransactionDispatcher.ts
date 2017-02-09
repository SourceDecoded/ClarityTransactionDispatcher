import { ISystem } from "./interfaces";

/**
 * Class that organizes systems to respond to data transactions.
 * The dispatcher manages the life-cycle of data entities. They can be
 * added, updated, removed, and read. The dispatcher is not responsible
 * for anything beyond this. It will notify the systems when any entity 
 * has been added, updated, removed, and read. This allows the dispatcher 
 * to remain unopinionated about tasks to run when a certain entity is 
 * added, updated, or removed.
 * 
 * The idea behind the dispatcher is to handle the complexity of the IoT.
 * There are many systems, devices, and other technologies that need to 
 * communicate for a company to run smoothly. We believe that answer to 
 * these needs is a data dispatcher which lets all independent systems know
 * about data changes.
 * 
 * The dispatcher will also notify the system when components on the entity
 * have been added updated or removed. This is critical for the systems to 
 * fulfill their responsibilities efficiently.
 */
export default class ClarityTransactionDispatcher {
    /**
     * Create a Dispatcher.
     * @constructor
     */
    constructor() {

    }

    /**
     * Add an Entity to the datastore. This will record
     * a transaction as well as maintain the current 
     * state of the entity.
     * @param {object} entity - The entity you want add.
     * @return {Promise}
     */
    addEntityAsync(entity: any) { }

    /**
     * Add a service for systems to use. Services could be HTTP services,
     * or governance that needs to be shared acrossed systems.
     * @param {string} name - The name by which the systems will request the service.
     * @param {object} service - The service.
     * @return {Promise}
     */
    addServiceAsync(name: string, service: any) { }

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
     *  - entityAddedAsync(entity: any)
     *  - entityUpdatedAsync(entity: any)
     *  - entityRemovedAsync(entity: any)
     *  - entityContentUpdatedAsync(entity: any)
     *  - entityComponentAddedAsync(entity: any, component: any)
     *  - entityComponentUpdatedAsync(entity: any, component: any)
     *  - entityComponentRemovedAsync(entity: any, component: any)
     *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     * @param {ISystem} system - The system to add.
     * @return {Promise} - An undefined Promise.
     */
    addSystemAsync(system: ISystem) { }

    /**
     * Get an entity by its id.
     * @param {string} id - The id of the desired entity.
     * @return {Promise<Entity>} - A Promise resolved with the entity or null.
     */
    getEntityByIdAsync(id: string) {

    }

    /**
     * Get a stream of the content of the entity.
     * @param {object} entity - The entity you want to get the content of.
     * @returns {stream} - Node read stream.
     */
    getEntityContentStream(entity: any) {

    }

    /**
     * Get a stream of the content of the entity.
     * @param {string} id - The id of the entity you want to get the content of.
     * @returns {stream} - Node read stream.
     */
    getEntityContentStreamById(id: string) {

    }

    /**
     * Get a range of entities.
     * @param {number} skip - The amount of entities you want to skip.
     * @param {number} take - The amount of entities you want to take.
     * @return {Promise<Array<object>>} - The range of entities.
     */
    getEntitiesAsync(skip: number, take: number) {

    }

    /**
     * Get a service by the name given.
     * @param {string} name - The name of the desired service.
     * @returns {object} - Null or the desired service.
     */
    getService(name: string) {


    }

    /**
     * Pauses the dispatcher.
     */
    pause() { }

    /**
     * Removes an entity.
     * @param {object} entity - The entity to be removed.
     * @returns {Promise<undefined>} 
     */
    removeEntityAsync(entity: any) { }

    /**
     * Removes a service by its name.
     * @param {string} name - The name of the service to be removed.
     * @returns {undefined}
     */
    removeService(name: string) { }

    /**
     * Removes a system.
     * @param {system} - The system to be removed.
     * @returns {Promise<undefined>} - Resolves when the system is disposed.
     */
    removeSystemAsync(system: ISystem) { }

    /**
     * Starts the dispatcher.
     */
    start() { }

    /**
     * Updated an entity.
     * @param {object} entity - The updated entity.
     * @returns {Promise<undefined>} - Resolves when the entity is saved.
     */
    updateEntityAsync(entity: any) { }

}