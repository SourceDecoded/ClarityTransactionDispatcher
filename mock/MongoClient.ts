import MongoDB from "./MongoDB";

export default class MongoClient  {
    private _config;
    private _connectErrorToThrow;

    constructor(config) {
        this._config = <any>config || {};
        this._connectErrorToThrow = config.connectErrorToThrow || null;
    }

    connect(databaseUrl: string, callback: (error, db: MongoDB) => void) {
        setTimeout(() => {
            if (this._connectErrorToThrow != null) {
                callback(this._connectErrorToThrow, null);
                return;
            }

            callback(null, new MongoDB(this._config));
        }, 0);
    }

}
