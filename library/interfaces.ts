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
    activatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    disposeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    deactivatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    entityAddedAsync(entity: { _id: string });
    entityUpdatedAsync(oldEntity: any, newEntity: any);
    entityRemovedAsync(entity: { _id: string });
    entityContentUpdatedAsync(oldContentId: string, newContentId: string);
    entityComponentAddedAsync(entity: { _id: string }, component: any);
    entityComponentUpdatedAsync(entity: { _id: string }, oldComponent: any, newComponent: any);
    entityComponentRemovedAsync(entity: { _id: string }, component: any);
    initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher);
    validateEntityAsync(entity: { _id: string });
    validateComponentAsync(component: { _id: string });
    validateEntityContentAsync(entity: { _id: string });

}

export interface ILogger {
    warn(message: string, ...data: any[]): void;
    error(message: string, ...data: any[]): void;
    message(message: string, ...data: any[]): void;
    info(message: string, ...data: any[]): void;
    debug(message: string, ...data: any[]): void;
}