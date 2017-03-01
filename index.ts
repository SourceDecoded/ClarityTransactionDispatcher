import * as express from "express";
import ClarityTransactionDispatcher from "./library/ClarityTransactionDispatcher";
import MongoFactory from "./library/MongoFactory";
import DispatcherApiSystem from "./systems/DispatcherApiSystem";
import DispatcherMonitorSystem from "./systems/DispatcherMonitorSystem";

const mongoFactory = new MongoFactory();

const dispatcher = new ClarityTransactionDispatcher({
    mongoFactory: mongoFactory,
    databaseUrl: "mongodb://localhost:27017/ClarityTransactionDispatcher"
});

dispatcher.addServiceAsync("express", express()).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem());
}).catch((error) => {
    console.log(error);
});