"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ClarityTransactionDispatcher_1 = require("./../library/ClarityTransactionDispatcher");
const MongoFactory_1 = require("./../library/MongoFactory");
const DispatcherApiSystem_1 = require("./../systems/DispatcherApiSystem");
const DispatcherMonitorSystem_1 = require("./../systems/DispatcherMonitorSystem");
const LeavittSocialSystem_1 = require("./../systems/LeavittSocialSystem");
const LeavittGroupAuthentication_1 = require("./../services/LeavittGroupAuthentication");
const FileSystemService_1 = require("./../services/FileSystemService");
const jwtSimple = require("jwt-simple");
const databaseUrl = "mongodb://localhost:27017/ClarityTransactionDispatcher";
const mongoFactory = new MongoFactory_1.default();
let server;
let app = express();
let authenticator = new LeavittGroupAuthentication_1.default(jwtSimple);
let fileSystem = new FileSystemService_1.default({ mongoFactory, databaseUrl });
server = app.listen(3005, () => console.log("Disptacher Server is running locally on port 3005..."));
let dispatcher = new ClarityTransactionDispatcher_1.default({ mongoFactory, databaseUrl });
dispatcher.addServiceAsync("express", app).then(() => {
    //return dispatcher.addServiceAsync("authenticator", authenticator);
    return dispatcher.addServiceAsync("fileSystem", fileSystem);
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem_1.default());
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherMonitorSystem_1.default());
}).then(() => {
    return dispatcher.addSystemAsync(new LeavittSocialSystem_1.default());
}).catch((error) => {
    console.log(error);
});
//# sourceMappingURL=index.js.map