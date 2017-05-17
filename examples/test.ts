import * as express from "express";
import ClarityTransactionDispatcher from "./../library/ClarityTransactionDispatcher";
import MongoFactory from "./../library/MongoFactory";
import DispatcherApiSystem from "./../systems/DispatcherApiSystem";
import DispatcherMonitorSystem from "./../systems/DispatcherMonitorSystem";
import FileSystemService from "./../services/FileSystemService";

const databaseUrl = "mongodb://localhost:27017/ClarityTransactionDispatcher";
const mongoFactory = new MongoFactory();
let server;
let app = express();
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
}).then(() => {
    return dispatcher.addSystemAsync({
        getGuid:()=>{
            return "test1";
        },
        getName: ()=>{
            return "Test1";
        },
        prepareEntityToBeAddedAsync: (entity)=>{
            entity.components.push({
                type:"tester-1"
            });
        }
    });
}).then(() => {
    return dispatcher.addSystemAsync({
        getGuid:()=>{
            return "test2";
        },
        getName: ()=>{
            return "Test2";
        },
        prepareEntityToBeAddedAsync: (entity)=>{
            entity.components.push({
                type:"tester-2"
            });
        }
    });
}).catch((error) => {
    console.log(error);
});