import ClarityTransactionDispatcher from "./ClarityTransactionDispatcher";


export default class Transaction {
    private dispatcher: ClarityTransactionDispatcher;
    private revertActions: Array<() => Promise<any>>;

    constructor(dispatcher: ClarityTransactionDispatcher) {
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

    addComponentAsync(entity: { _id: string }, component: { _id: string, type: string, entity_id: string }) {
        return this.dispatcher.addComponentAsync(entity, component).then((component) => {
            this.revertActions.push(() => {
                return this.dispatcher.removeComponentAsync(<any>component);
            });
            return entity;
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }

    addEntityAsync(entity: any) {
        return this.dispatcher.addEntityAsync(entity).then((entity) => {
            this.revertActions.push(() => {
                return this.dispatcher.removeEntityAsync(<any>entity);
            });
            return entity;
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }

    updateEntityContentByStreamAsync(entity: { _id: string }, stream: NodeJS.ReadableStream) { }

    updateComponentAsync(entity: any, component: { _id: string; type: string; }) { }

    updateEntityAsync(entity: { _id: string }) { }

    removeComponentAsync(component: { _id: string, type: string, entity_id: string }) {
        return this.dispatcher.removeComponentAsync(component).then((component: any) => {
            this.revertActions.push(() => {
                return this.dispatcher.getEntityByIdAsync(component.entity_id).then((entity: any) => {
                    return this.dispatcher.addComponentAsync(entity, component);
                });
            });
            return component;
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }

    removeEntityAsync(entity: { _id: string, content_id: string }) {
        return this.dispatcher.removeEntityAsync(entity).then(() => {
            this.revertActions.push(() => {
                return this.dispatcher.addEntityAsync(entity);
            });
        }).catch((error) => {
            return this._revertAsync(error);
        });
    }

    removeEntityContentAsync(entity: { _id: string, content_id: string }) {

    }

    confirmAsync() {

    }

}