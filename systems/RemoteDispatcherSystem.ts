import ClarityTransactionDispatcher from "./../library/ClarityTransactionDispatcher";

export default class RemoteDispatcherSystem {
    private _socketStream;
    private _socketStreamInstance;
    private _socket;
    private _name;
    private _guid;
    private _clarityTransactionDispatcher: ClarityTransactionDispatcher;

    constructor(config) {
        this._name = "RemoteDispatcherSystem";
        this._guid = "b42ea3d4-1ef6-4f00-8630-298366160df8";

        if (config == null) {
            throw new Error("Needs to provide a socket and a socket stream.");
        }

        if (config.socket == null) {
            throw new Error("Needs to provide a socket to pipe to.");
        }

        if (config.socketStream == null) {
            throw new Error("Needs to provide a socket stream.");
        }

        this._socketStream = config.socketStream;
        this._socket = config.socket;
        this._socketStreamInstance = this._socketStream(this._socket);
    }

    private _buildMethod(methodName: string) {
        this._socket.on(methodName, (data) => {
            if (data.id != null && Array.isArray(data.arguments)) {
                this._clarityTransactionDispatcher[methodName].apply(this._clarityTransactionDispatcher, arguments).then((response) => {
                    this._respond(data.id, response);
                }).catch((error) => {
                    this._respondByError(data.id, error);
                });
            }
        });
    }

    private _buildSocketInterface() {
        this._buildMethod("addComponentAsync");
        this._buildMethod("addEntityAsync");
        this._buildMethod("approveComponentRemovalAsync");
        this._buildMethod("approveEntityRemovalAsync");
        this._buildMethod("getComponentByIdAsync");
        this._buildMethod("getComponentsByEntityAndTypeAsync");
        this._buildMethod("getComponentsByEntityAsync");
        this._buildMethod("getEntityByIdAsync");

    }

    private _respond(id, response) {
        this._socket("response", {
            id: id,
            response: response,
            error: null
        });
    }

    private _respondByError(id, error) {
        this._socket("response", {
            id: id,
            response: null,
            error: {
                message: error.message
            }
        });
    }

    activatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher) {

    }

    approveComponentRemovalAsync(component: { _id: string; entity_id: string }) { }

    approveEntityRemovalAsync(entity: { _id: string }) { }

    deactivatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher) { }

    disposeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher) { }

    entityAddedAsync(entity: { _id: string }) { }

    entityUpdatedAsync(oldEntity: any, newEntity: any) { }

    entityRemovedAsync(entity: { _id: string }) { }

    entityRetrievedAsync?(entity: { _id: string }) { }

    entityContentUpdatedAsync(oldContentId: string, newContentId: string) { }

    entityComponentAddedAsync(entity: { _id: string }, component: any) { }

    entityComponentUpdatedAsync(entity: { _id: string }, oldComponent: any, newComponent: any) { }

    entityComponentRemovedAsync(entity: { _id: string }, component: any) { }

    entityComponentRetrievedAsync?(entity: { _id: string }, component: any) { }

    getName() { }

    getGuid() { }

    initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher) {
        this._clarityTransactionDispatcher = clarityTransactionDispatcher;
    }

    serviceRemovedAsync(name: string, service: any) { }

    validateEntityAsync(entity: { _id: string }) { }

    validateComponentAsync(component: { _id: string }) { }

    validateEntityContentAsync(entity: { _id: string }, oldContentId: string, newContentId: string) { }


}