"use strict";
class RemoteDispatcherSystem {
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
    _buildMethod(methodName) {
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
    _buildSocketInterface() {
        this._buildMethod("addComponentAsync");
        this._buildMethod("addEntityAsync");
        this._buildMethod("approveComponentRemovalAsync");
        this._buildMethod("approveEntityRemovalAsync");
        this._buildMethod("getComponentByIdAsync");
        this._buildMethod("getComponentsByEntityAndTypeAsync");
        this._buildMethod("getComponentsByEntityAsync");
        this._buildMethod("getEntityByIdAsync");
    }
    _respond(id, response) {
        this._socket("response", {
            id: id,
            response: response,
            error: null
        });
    }
    _respondByError(id, error) {
        this._socket("response", {
            id: id,
            response: null,
            error: {
                message: error.message
            }
        });
    }
    activatedAsync(clarityTransactionDispatcher) {
    }
    approveComponentRemovalAsync(component) { }
    approveEntityRemovalAsync(entity) { }
    deactivatedAsync(clarityTransactionDispatcher) { }
    disposeAsync(clarityTransactionDispatcher) { }
    entityAddedAsync(entity) { }
    entityUpdatedAsync(oldEntity, newEntity) { }
    entityRemovedAsync(entity) { }
    entityRetrievedAsync(entity) { }
    entityContentUpdatedAsync(oldContentId, newContentId) { }
    entityComponentAddedAsync(entity, component) { }
    entityComponentUpdatedAsync(entity, oldComponent, newComponent) { }
    entityComponentRemovedAsync(entity, component) { }
    entityComponentRetrievedAsync(entity, component) { }
    getName() { }
    getGuid() { }
    initializeAsync(clarityTransactionDispatcher) {
        this._clarityTransactionDispatcher = clarityTransactionDispatcher;
    }
    serviceRemovedAsync(name, service) { }
    validateEntityAsync(entity) { }
    validateComponentAsync(component) { }
    validateEntityContentAsync(entity, oldContentId, newContentId) { }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteDispatcherSystem;
//# sourceMappingURL=index.js.map