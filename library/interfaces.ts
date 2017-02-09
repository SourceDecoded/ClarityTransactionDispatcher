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

export interface ILogger {
    warn(message: string, ...data: any[]): void;
    error(message: string, ...data: any[]): void;
    message(message: string, ...data: any[]): void;
    info(message: string, ...data: any[]): void;
    debug(message: string, ...data: any[]): void;
}