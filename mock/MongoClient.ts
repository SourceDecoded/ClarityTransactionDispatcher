import MongoDB from "./MongoDB";

export default class MongoClient  {
    private _config;
    private _responses;

    constructor(config) {
        this._config = <any>config || {};
        this._responses = this._config.responses;
    }

    connect(databaseUrl: string, callback: (error, db: MongoDB) => void) {
        var response = this._responses.shift();

        if (response == null){
            throw new Error("Expected a response.");
        }
        
        var connectErrorToThrow = response.connectErrorToThrow;

        setTimeout(() => {
            if (connectErrorToThrow != null) {
                callback(connectErrorToThrow, null);
                return;
            }

            callback(null, new MongoDB(response));
        }, 0);
    }

}
