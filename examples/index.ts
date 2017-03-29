import * as express from "express";
import ClarityTransactionDispatcher from "./../library/ClarityTransactionDispatcher";
import MongoFactory from "./../library/MongoFactory";
import DispatcherApiSystem from "./../systems/DispatcherApiSystem";
import DispatcherMonitorSystem from "./../systems/DispatcherMonitorSystem";
import LeavittGroupAuthentication from "./../services/LeavittGroupAuthentication";
import * as jwtSimple from "jwt-simple";

const mongoFactory = new MongoFactory();
let server;
let app = express();
let authenticator = new LeavittGroupAuthentication(jwtSimple);

server = app.listen(3005, () => console.log("Disptacher Server is running locally on port 3005..."));

let dispatcher = new ClarityTransactionDispatcher({
    mongoFactory: mongoFactory,
    databaseUrl: "mongodb://localhost:27017/ClarityTransactionDispatcher"
});


dispatcher.addServiceAsync("express", app).then(() => {
    //return dispatcher.addServiceAsync("authenticator", authenticator);
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem());
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherMonitorSystem());
}).catch((error) => {
    console.log(error);
});