import assert from "assert";
import { MongoDb } from "./../index";

// const DATABASE_NAME = "clarity_transaction_dispatcher";
// var mongoDb = null;

// var types = [
//     "post",
//     "comment",
//     "authorization",
//     "group",
//     "user",
//     "governance"
// ];

// var versions = [
//     "0.0.1",
//     "0.0.2",
//     "0.0.3",
//     "0.0.4",
// ];

// var getRandomType = () => {
//     var index = parseInt(Math.random() * types.length, 10);
//     return types[index];
// };

// var getRandomVersion = () => {
//     var index = parseInt(Math.random() * versions.length, 10);
//     return versions[index];
// };

// var createRandomComponent = () => {
//     var component = {
//         type: getRandomType(),
//         version: getRandomVersion()
//     };

//     return component;
// };

// var createRandomEntity = () => {
//     var entity = {
//         _id: objectId(),
//         components: []
//     };

//     var amountOfComponents = parseInt(Math.random() * 10, 10);

//     for (var x = 0; x < amountOfComponents; x++) {
//         entity.components.push(createRandomComponent());
//     }

//     return entity;
// };

// var createEntitiesAsync = (amount, batchSize = 10000) => {
//     var batchAmount = amount / batchSize;

//     var batches = [];
//     for (var x = 0; x < batchAmount; x++) {
//         batches.push(new Batch(createRandomEntity, batchSize));
//     }

//     batches.reduce((promise, batch) => {
//         return promise.then(() => {
//             return batch.createEntitiesAsync();
//         });

//     }, Promise.resolve()).then(() => {
//         console.log("DONE");
//     });
// }

// class Batch {

//     constructor(factory, size) {
//         this.factory = factory;
//         this.size = size;
//     }

//     createEntitiesAsync() {
//         return mongodb.getDatabaseAync(DATABASE_NAME).then((db) => {
//             var entities = [];
//             for (var x = 0; x < this.size; x++) {
//                 entities.push(this.factory());
//             }

//             return entities.map((entity) => {
//                 return db.collection("entities").insert(entity);
//             });
//         });
//     }

// }

// exports.clean = function () {
//     return mongoDb.getDatabaseAsync(DATABASE_NAME).then((db) => {
//         return Promise.all([
//             db.collection("entities").remove({}),
//             db.collection("systemData").remove({})
//         ]);
//     });
// };

// exports.prepare = function () {
//     mongoDb = new MongoDb({
//         isInMemory: true
//     });
//     return mongoDb.startAsync().then(()=>{
//         return mongoDb.getDatabaseAsync(DATABASE_NAME);
//     }).then((db)=>{
//         db.insert()
//     });
// };

// exports.destroy = function () {
// };

