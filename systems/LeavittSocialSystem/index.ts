import * as mongodb from "mongodb";
import Router from "./app/Router";

const POSTS_COLLECTION = "posts";

export default class LeavittSocialSystem {
    dispatcher: any;
    app: any;
    ObjectID: any;
    guid: string;
    name: string;

    constructor() {
        this.dispatcher;
        this.app;
        this.ObjectID = mongodb.ObjectID;
        this.guid = "6B20BD89-29F2-492A-BDCF-31DFA7D37AE3";
        this.name = "Leavitt Social System";
    }

    // SYSTEM PRIVATE METHODS
    private _addItemToCollectionAsync(item: any, collectionName: string) {
        return this._getDatabaseAsync().then((db: any) => {
            return db.collection(collectionName);
        }).then((collection) => {
            return collection.insertOne(item);
        }).then((result) => {
            item._id = result.insertedId;
            return item;
        });
    }

    private _addLeavittSocialPostAsync(entity) {
        let post = {
            entity_id: this.ObjectID(entity._id),
            isPinned: false,
            createdBy: {},
            publishedDate: null,
            message: null,
            images: [],
            videos: [],
            links: [],
            likes: [],
            comments: [],
            publishTo: []
        };

        const componentTypes = {
            "LEAVITT_SOCIAL_PINNED": () => post.isPinned = true
        };

        return this.dispatcher.getComponentsByEntityAsync(entity).then(components => {
            components.forEach(component => {
                if (componentTypes[component.type]) {
                    componentTypes[component.type]();
                }
            });

            return this._addItemToCollectionAsync(post, POSTS_COLLECTION);
        });
    }

    private _initAPI() {
        const router = new Router(this.app, this);
        router.init();

        this.app.listen(3008, () => console.log("Leavitt Social Server is running locally on port 3008..."));
    }

    private _isInterestedInEntityAsync(entity) {
        return this.dispatcher.getComponentsByEntityAsync(entity).then(components => {
            let interestedComponents = components.filter(component => {
                return component.type === "LEAVITT_SOCIAL_POST"
            });

            if (interestedComponents.length > 0) {
                return Promise.resolve(true);
            } else {
                return Promise.resolve(false);
            }
        });
    }

    private _getDatabaseAsync() {
        return new Promise((resolve, reject) => {
            const url = "mongodb://localhost:27017/LeavittSocial";
            const MongoClient = mongodb.MongoClient;

            MongoClient.connect(url, (error, db) => {
                if (error != null) {
                    reject(error);
                } else {
                    resolve(db);
                }
            });
        });
    }

    // SYSTEM LIFE CYCLE AND REQUIRED METHODS
    activatedAsync(dispatcher) {
        this.dispatcher = dispatcher;
        this.app = this.dispatcher.getService("express");

        this._initAPI();
    }

    entityAddedAsync(entity) {
        return this._isInterestedInEntityAsync(entity).then(isInterested => {
            if (isInterested) {
                return this._addLeavittSocialPostAsync(entity).then(post => {
                    console.log(post)
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    entityContentUpdatedAsync(oldContentId, newContentId) {

    }

    getGuid() {
        return this.guid;
    }

    getName() {
        return this.name;
    }

    // SYSTEM SPECIFIC PUBLIC METHODS

}