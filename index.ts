import * as express from "express";
import ClarityTransactionDispatcher from "./library/ClarityTransactionDispatcher";
import MongoFactory from "./library/MongoFactory";
import DispatcherApiSystem from "./systems/DispatcherApiSystem";
import DispatcherMonitorSystem from "./systems/DispatcherMonitorSystem";

const mongoFactory = new MongoFactory();
var server;

var createDispatcher = () => {
    var app = express();
    server = app.listen(3005, () => console.log("Server is running locally on port 3005..."));

    var dispatcher = new ClarityTransactionDispatcher({
        mongoFactory: mongoFactory,
        databaseUrl: "mongodb://localhost:27017/ClarityTransactionDispatcher"
    });

    dispatcher.addServiceAsync("express", app).then(() => {
        return dispatcher.addSystemAsync(new DispatcherApiSystem());
    }).then(() => {
        return dispatcher.addSystemAsync(new DispatcherMonitorSystem());
    }).catch((error) => {
        console.log(error);
    });
};

process.on("uncaughtException", (error) => {
    server.close();
    createDispatcher();
});

createDispatcher();