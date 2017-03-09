import { IMongoDb, IMongo, IGridFs, IMongoFactory } from "./../library/interfaces";
import GridFs from "./GridFs";
import Mongo from "./Mongo";

export default class MongoFactory implements IMongoFactory {
    mongodb: IMongo;
    gridFs: IGridFs;

    constructor(config: {
        gridFsConfig: { responses: Array<any>; readContent?: string; };
        mongodbConfig: { responses: Array<any>; };
    }) {
        this.gridFs = new GridFs(config.gridFsConfig);
        this.mongodb = <any> new Mongo(config.mongodbConfig);
    }

    createMongodb() {
        return this.mongodb;
    }

    createGridFs(db: IMongoDb, mongodb: IMongo) {
        return this.gridFs;
    }
}