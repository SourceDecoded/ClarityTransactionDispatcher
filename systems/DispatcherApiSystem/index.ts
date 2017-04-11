import Router from "./app/Router";

export default class DispatcherApiSystem {
    clarityTransactionDispatcher: any;
    app: any;
    guid: string;
    name: string;
    authenticator: { decode: (token: string) => any };
    fileSystem: any;

    constructor() {
        this.clarityTransactionDispatcher = null;
        this.app = null;
        this.guid = "13CE560D-9B85-4C85-8BA4-72EA1686EBAA";
        this.name = "Dispatcher Api System";
        this.authenticator = null;
        this.fileSystem = null;
    }

    private _initAPI() {
        const router = new Router(this);
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
            } else {
                return Promise.reject(new Error("The entity provided does not have a component with that id."));
            }
        });
    }
}