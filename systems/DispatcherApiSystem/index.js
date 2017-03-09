"use strict";
const Router_1 = require("./app/Router");
class DispatcherApiSystem {
    constructor() {
        this.clarityTransactionDispatcher = null;
        this.app = null;
        this.guid = "13CE560D-9B85-4C85-8BA4-72EA1686EBAA";
        this.name = "DispatcherApiSystem";
    }
    _runAPI() {
        const router = new Router_1.default(this.app, this.clarityTransactionDispatcher);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherApiSystem;
//# sourceMappingURL=index.js.map