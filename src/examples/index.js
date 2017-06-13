import express from "express";
import { ClarityTransactionDispatcher, DispatcherApiSystem, DispatcherMonitorSystem } from "./../index.js";
import FileSystemService from "./../services/FileSystemService";
import * as GridFs from "gridfs-stream";
import * as mongodb from "mongodb";
import * as jwtSimple from "jwt-simple";

const databaseUrl = "mongodb://localhost:27017/ClarityTransactionDispatcher";
let server;
let app = express();
let fileSystem = new FileSystemService({ mongodb, GridFs, databaseUrl });

server = app.listen(3005, () => console.log("Disptacher Server is running locally on port 3005..."));

let dispatcher = new ClarityTransactionDispatcher();

dispatcher.startAsync().then(() => {
    return dispatcher.addServiceAsync("express", app);
}).then(() => {
    return dispatcher.addServiceAsync("fileSystem", fileSystem);
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherApiSystem());
}).then(() => {
    return dispatcher.addSystemAsync(new DispatcherMonitorSystem());
}).catch((error) => {
    console.log(error);
});