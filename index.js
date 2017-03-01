"use strict";
const express = require("express");
const ClarityTransactionDispatcher_1 = require("./library/ClarityTransactionDispatcher");
const MongoFactory_1 = require("./library/MongoFactory");
const DispatcherApiSystem_1 = require("./systems/DispatcherApiSystem");
const mongoFactory = new MongoFactory_1.default();
const dispatcher = new ClarityTransactionDispatcher_1.default({
    mongoFactory: mongoFactory,
    databaseUrl: "mongodb://localhost:27017/ClarityTransactionDispatcher"
});
dispatcher.addServiceAsync("express", express()).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem_1.default());
}).catch((error) => {
    console.log(error);
});
//# sourceMappingURL=index.js.map