import ClarityTransactionDispatcher from "./ClarityTransactionDispatcher";

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
    disposeAsync?(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    deactivatedAsync?(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    entityAddedAsync?(entity: any);
    entityUpdatedAsync?(entity: any);
    entityRemovedAsync?(entity: any);
    entityContentUpdatedAsync?(entity: any);
    entityComponentAddedAsync?(entity: any, component: any);
    entityComponentUpdatedAsync?(entity: any, component: any);
    entityComponentRemovedAsync?(entity: any, component: any);
    initializeAsync?(clarityTransactionDispatcher: ClarityTransactionDispatcher);

}