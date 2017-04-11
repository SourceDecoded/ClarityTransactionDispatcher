"use strict";
const Router_1 = require("./app/Router");
class DispatcherApiSystem {
    constructor() {
        this.clarityTransactionDispatcher = null;
        this.app = null;
        this.guid = "13CE560D-9B85-4C85-8BA4-72EA1686EBAA";
        this.name = "Dispatcher Api System";
        this.authenticator = null;
        this.fileSystem = null;
    }
    _initAPI() {
        const router = new Router_1.default(this);
        router.init();
    }
    activatedAsync(clarityTransactionDispatcher) {
        this.clarityTransactionDispatcher = clarityTransactionDispatcher;
        this.fileSystem = this.clarityTransactionDispatcher.getService("fileSystem");
        this._initAPI();
    }
    getGuid() {
        return this.guid;
    }
    getName() {
        return this.name;
    }
    getComponentsByEntityIdAsync(id) {
        return this.clarityTransactionDispatcher.getEntityByIdAsync(id).then(entity => {
            return Promise.resolve(entity.components);
        });
    }
    getComponentByIdAsync(componentId, entityId) {
        return this.getComponentsByEntityIdAsync(entityId).then(components => {
            const component = components.filter(component => component._id == componentId)[0];
            if (component) {
                return Promise.resolve(component);
            }
            else {
                return Promise.reject(new Error("The entity provided does not have a component with that id."));
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherApiSystem;
//# sourceMappingURL=index.js.map