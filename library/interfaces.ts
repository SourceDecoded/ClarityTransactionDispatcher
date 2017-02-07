export interface ISystem {
    // Required interfaces.
    getDependencies();
    getGuid();
    getName();

    // Optional interfaces.
    activatedAsync?();
    disposeAsync?();
    deactivatedAsync?();
    entityAddedAsync?();
    entityUpdatedAsync?();
    entityRemovedAsync?();
    entityContentUpdatedAsync?();
    entityComponentAddedAsync?();
    entityComponentUpdatedAsync?();
    entityComponentRemovedAsync?();
    initializeAsync?();

}