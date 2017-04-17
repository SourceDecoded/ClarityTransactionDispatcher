import * as express from "express";
import ClarityTransactionDispatcher from "./../library/ClarityTransactionDispatcher";
import MongoFactory from "./../library/MongoFactory";
import DispatcherApiSystem from "./../systems/DispatcherApiSystem";
import DispatcherMonitorSystem from "./../systems/DispatcherMonitorSystem";
import LeavittGroupAuthentication from "./../services/LeavittGroupAuthentication";
import FileSystemService from "./../services/FileSystemService";
import * as jwtSimple from "jwt-simple";

const databaseUrl = "mongodb://localhost:27017/ClarityTransactionDispatcher";
const mongoFactory = new MongoFactory();
let server;
let app = express();
let authenticator = new LeavittGroupAuthentication(jwtSimple);
let fileSystem = new FileSystemService({ mongoFactory, databaseUrl });

server = app.listen(3005, () => console.log("Disptacher Server is running locally on port 3005..."));

let dispatcher = new ClarityTransactionDispatcher({ mongoFactory, databaseUrl });

dispatcher.addServiceAsync("express", app).then(() => {
    //return dispatcher.addServiceAsync("authenticator", authenticator);
}).then(() => {
    return dispatcher.addServiceAsync("fileSystem", fileSystem);
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem());
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherMonitorSystem());
}).catch((error) => {
    console.log(error);
});