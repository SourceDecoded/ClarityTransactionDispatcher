import express from "express";
import { ClarityTransactionDispatcher, DispatcherApiSystem, DispatcherMonitorSystem, MongoDb } from "./../index.js";
import FileSystemService from "./../services/FileSystemService";
import * as jwtSimple from "jwt-simple";

let app = express();
let mongoDb = new MongoDb({
    isInMemory: true
});
let fileSystem = new FileSystemService(mongoDb);
let dispatcher = new ClarityTransactionDispatcher(mongoDb);

app.listen(3005, () => console.log("Disptacher Server is running locally on port 3005..."));

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

setTimeout(()=>{
    dispatcher.stopAsync();
},15000);