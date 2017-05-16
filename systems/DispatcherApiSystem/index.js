"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    addComponentAsync(entityId, component) {
        return this.clarityTransactionDispatcher.getEntityByIdAsync(entityId).then(entity => {
            entity.components.push(component);
            return this.clarityTransactionDispatcher.updateEntityAsync(entity);
        }).then(updatedEntity => {
            return Promise.resolve(updatedEntity.components.slice(-1)[0]);
        });
    }
    addFileAsync(file) {
        const fileId = this.clarityTransactionDispatcher.ObjectID();
        return this.fileSystem.getFileWriteStreamByIdAsync(fileId).then(writeStream => {
            return new Promise((resolve, reject) => {
                let contentLength = 0;
                file.on("data", data => {
                    contentLength += data.length;
                });
                file.on("end", () => {
                    resolve({ contentLength, fileId });
                });
                file.on("error", error => {
                    reject(error);
                });
                file.pipe(writeStream);
            });
        });
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
    getComponentAsync(componentId, entityId) {
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
    removeComponentAsync(componentId, entityId) {
        let removedComponent;
        return this.clarityTransactionDispatcher.getEntityByIdAsync(entityId).then(entity => {
            const componentIndex = entity.components.findIndex(component => component._id == componentId);
            if (componentIndex !== -1) {
                removedComponent = entity.components.splice(componentIndex, 1);
            }
            else {
                return Promise.reject(new Error("The entity provided does not have a component with that id."));
            }
            return this.clarityTransactionDispatcher.updateEntityAsync(entity);
        }).then(() => {
            return Promise.resolve(removedComponent);
        });
    }
    removeEntityByIdAsync(id) {
        return this.clarityTransactionDispatcher.getEntityByIdAsync(id).then(entity => {
            return this.clarityTransactionDispatcher.removeEntityAsync(entity);
        });
    }
    updateEntityAsync(entityId, entity) {
        return this.clarityTransactionDispatcher.getEntityByIdAsync(entityId).then(originalEntity => {
            entity._id = originalEntity._id;
            entity.createdDate = originalEntity.createdDate;
            return Object.assign({}, originalEntity, entity);
        }).then(newEntity => {
            return this.clarityTransactionDispatcher.updateEntityAsync(newEntity);
        });
    }
    updateComponentAsync(componentId, entityId, component) {
        let newComponent;
        return this.getComponentAsync(componentId, entityId).then(oldComponent => {
            component._id = oldComponent._id;
            newComponent = Object.assign({}, oldComponent, component);
            return this.clarityTransactionDispatcher.getEntityByIdAsync(entityId);
        }).then(entity => {
            const componentIndex = entity.components.findIndex(component => component._id == componentId);
            entity.components[componentIndex] = newComponent;
            return this.clarityTransactionDispatcher.updateEntityAsync(entity);
        }).then(updatedEntity => {
            return this.getComponentAsync(componentId, entityId);
        });
    }
}
exports.default = DispatcherApiSystem;
//# sourceMappingURL=index.js.map