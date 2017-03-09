import Router from "./app/Router";

export default class DispatcherApiSystem {
    clarityTransactionDispatcher: any;
    app: any;
    guid: string;
    name: string;

    constructor() {
        this.clarityTransactionDispatcher = null;
        this.app = null;
        this.guid = "13CE560D-9B85-4C85-8BA4-72EA1686EBAA";
        this.name = "DispatcherApiSystem";
    }

    private _runAPI() {
        const router = new Router(this.app, this.clarityTransactionDispatcher);
        router.init();
    }

    activatedAsync(clarityTransactionDispatcher) {
        this.clarityTransactionDispatcher = clarityTransactionDispatcher;
        this.app = this.clarityTransactionDispatcher.getService("express");

        this._runAPI();
    }

    getGuid() {
        return this.guid;
    }

    getName() {
        return this.name;
    }
}