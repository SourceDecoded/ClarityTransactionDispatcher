import { IMongoDb, IMongo, IGridFs, IMongoFactory } from "./interfaces";
import * as GridFs from "gridfs-stream";
import * as mongodb from "mongodb";

export default class MongoFactory implements IMongoFactory {
    mongodb: IMongo;
    gridFs: IGridFs;

    createMongodb() {
        return mongodb;
    }

    createGridFs(db: IMongoDb, mongodb: IMongo) {
        return new GridFs(db, mongodb);
    }
}