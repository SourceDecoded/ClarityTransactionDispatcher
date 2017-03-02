"use strict";
const http = require("http");
const socketIO = require("socket.io");
class DispatcherMonitorSystem {
    constructor() {
        this.clarityTransactionDispatcher;
        this.app;
        this.io;
        this.guid = "3A07CA2A-1A79-4A79-98FE-B3FA747A9CB2";
        this.name = "DispatcherMonitorSystem";
    }
    activatedAsync(clarityTransactionDispatcher) {
        this.clarityTransactionDispatcher = clarityTransactionDispatcher;
        this.app = this.clarityTransactionDispatcher.getService("express");
        this._listenForClientToConnect();
    }
    entityAddedAsync(entity) {
        this.io.emit("entityAdded", { entity });
    }
    entityUpdatedAsync(oldEntity, newEntity) {
        this.io.emit("entityUpdated", { oldEntity, newEntity });
    }
    entityRemovedAsync(entity) {
        this.io.emit("entityRemoved", { entity });
    }
    entityContentUpdatedAsync(oldContentId, newContentId) {
        //TODO: Add Content Support
    }
    entityComponentAddedAsync(entity, component) {
        this.io.emit("entityComponentAdded", { entity, component });
    }
    entityComponentUpdatedAsync(entity, oldComponent, newComponent) {
        this.io.emit("entityComponentUpdated", { entity, oldComponent, newComponent });
    }
    entityComponentRemovedAsync(entity, component) {
        this.io.emit("entityComponentRemoved", { entity, component });
    }
    serviceRemovedAsync(name, service) {
        this.io.emit("serviceRemoved", { name, service });
    }
    getGuid() {
        return this.guid;
    }
    getName() {
        return this.name;
    }
    _listenForClientToConnect() {
        const server = http.createServer(this.app);
        this.io = socketIO(server);
        this.io.on("connection", (client) => {
            console.log("Client connected on port 3006...");
        });
        server.listen(3006);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherMonitorSystem;
//# sourceMappingURL=index.js.map