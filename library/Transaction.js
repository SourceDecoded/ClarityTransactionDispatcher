"use strict";
class Transaction {
    constructor(dispatcher) {
        if (dispatcher == null) {
            throw new Error("");
        }
        this.dispatcher = dispatcher;
        this.revertActions = [];
    }
    _revertAsync(error) {
        return this.revertActions.reduce((promise, actionAsync) => {
            return promise.then(() => {
                return actionAsync();
            });
        }, Promise.resolve()).then(() => {
            return Promise.reject(error);
        }).catch((error) => {
            // Couldn't revert.
        });
    }
    addComponentAsync(entity, component) {
        return this.dispatcher.addComponentAsync(entity, component).then((component) => {
            this.revertActions.push(() => {
                return this.dispatcher.removeComponentAsync(component);
            });
            return entity;
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }
    addEntityAsync(entity) {
        return this.dispatcher.addEntityAsync(entity).then((entity) => {
            this.revertActions.push(() => {
                return this.dispatcher.removeEntityAsync(entity);
            });
            return entity;
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }
    updateEntityContentByStreamAsync(entity, stream) { }
    updateComponentAsync(entity, component) { }
    updateEntityAsync(entity) { }
    removeComponentAsync(component) {
        return this.dispatcher.removeComponentAsync(component).then((component) => {
            this.revertActions.push(() => {
                return this.dispatcher.getEntityByIdAsync(component.entity_id).then((entity) => {
                    return this.dispatcher.addComponentAsync(entity, component);
                });
            });
            return component;
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }
    removeEntityAsync(entity) {
        return this.dispatcher.removeEntityAsync(entity).then(() => {
            this.revertActions.push(() => {
                return this.dispatcher.addEntityAsync(entity);
            });
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }
    removeEntityContentAsync(entity) {
    }
    confirmAsync() {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
//# sourceMappingURL=Transaction.js.map