"use strict";
const express = require("express");
const ClarityTransactionDispatcher_1 = require("./library/ClarityTransactionDispatcher");
const MongoFactory_1 = require("./library/MongoFactory");
const DispatcherApiSystem_1 = require("./systems/DispatcherApiSystem");
const mongoFactory = new MongoFactory_1.default();
var server;
var createDispatcher = function () {
    var app = express();
    server = app.listen(3005, () => console.log("Server is running locally on port 3005"));
    ;
    var dispatcher = new ClarityTransactionDispatcher_1.default({
        mongoFactory: mongoFactory,
        databaseUrl: "mongodb://localhost:27017/ClarityTransactionDispatcher"
    });
    dispatcher.addServiceAsync("express", app).then(() => {
        return dispatcher.addSystemAsync(new DispatcherApiSystem_1.default());
    }).catch((error) => {
        console.log(error);
    });
};
process.on('uncaughtException', function (err) {
    server.close();
    createDispatcher();
});
createDispatcher();
//# sourceMappingURL=index.js.map