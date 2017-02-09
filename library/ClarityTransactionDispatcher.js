"use strict";
/** Class representing a dispatcher.*/
class ClarityTransactionDispatcher {
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
    addEntityAsync(entity) { }
    /**
     * Add a service for systems to use. Services could be HTTP services,
     * or governance that needs to be shared acrossed systems.
     * @param {string} name - The name by which the systems will request the service.
     * @param {object} service - The service.
     * @return {Promise}
     */
    addServiceAsync(name, service) { }
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
     * @return {Promise}
     */
    addSystemAsync(system) { }
    getEntityByIdAsync() { }
    getEntityContentStream() { }
    getEntitiesAsync() { }
    getService(name) { }
    pause() { }
    removeEntityAsync(entity) { }
    removeServiceAsync(name) { }
    removeSystemAsync(system) { }
    start() { }
    updateEntityAsync(entity) { }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClarityTransactionDispatcher;
//# sourceMappingURL=ClarityTransactionDispatcher.js.map