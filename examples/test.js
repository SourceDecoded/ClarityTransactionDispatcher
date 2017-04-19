"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ClarityTransactionDispatcher_1 = require("./../library/ClarityTransactionDispatcher");
const MongoFactory_1 = require("./../library/MongoFactory");
const DispatcherApiSystem_1 = require("./../systems/DispatcherApiSystem");
const DispatcherMonitorSystem_1 = require("./../systems/DispatcherMonitorSystem");
const FileSystemService_1 = require("./../services/FileSystemService");
const databaseUrl = "mongodb://localhost:27017/ClarityTransactionDispatcher";
const mongoFactory = new MongoFactory_1.default();
let server;
let app = express();
let fileSystem = new FileSystemService_1.default({ mongoFactory, databaseUrl });
server = app.listen(3005, () => console.log("Disptacher Server is running locally on port 3005..."));
let dispatcher = new ClarityTransactionDispatcher_1.default({ mongoFactory, databaseUrl });
dispatcher.addServiceAsync("express", app).then(() => {
    //return dispatcher.addServiceAsync("authenticator", authenticator);
}).then(() => {
    return dispatcher.addServiceAsync("fileSystem", fileSystem);
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem_1.default());
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherMonitorSystem_1.default());
}).then(() => {
    return dispatcher.addSystemAsync({
        getGuid: () => {
            return "test1";
        },
        getName: () => {
            return "Test1";
        },
        prepareEntityToBeAddedAsync: (entity) => {
            entity.components.push({
                type: "tester-1"
            });
        }
    });
}).then(() => {
    return dispatcher.addSystemAsync({
        getGuid: () => {
            return "test2";
        },
        getName: () => {
            return "Test2";
        },
        prepareEntityToBeAddedAsync: (entity) => {
            entity.components.push({
                type: "tester-2"
            });
        }
    });
}).catch((error) => {
    console.log(error);
});
//# sourceMappingURL=test.js.map