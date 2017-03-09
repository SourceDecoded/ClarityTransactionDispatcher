"use strict";
const express = require("express");
const ClarityTransactionDispatcher_1 = require("./library/ClarityTransactionDispatcher");
const MongoFactory_1 = require("./library/MongoFactory");
const DispatcherApiSystem_1 = require("./systems/DispatcherApiSystem");
const DispatcherMonitorSystem_1 = require("./systems/DispatcherMonitorSystem");
const mongoFactory = new MongoFactory_1.default();
let server;
let app = express();
server = app.listen(3005, () => console.log("Disptacher Server is running locally on port 3005..."));
let dispatcher = new ClarityTransactionDispatcher_1.default({
    mongoFactory: mongoFactory,
    databaseUrl: "mongodb://localhost:27017/ClarityTransactionDispatcher"
});
dispatcher.addServiceAsync("express", app).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem_1.default());
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherMonitorSystem_1.default());
}).catch((error) => {
    console.log(error);
});
//# sourceMappingURL=index.js.map