import MongoDB from "./MongoDB";

export default class MongoClient {
    private _config;
    private _responses;

    constructor(config) {
        this._config = <any>config || {};
        this._responses = this._config.responses;
    }

    connect(databaseUrl: string, callback: (error, db: MongoDB) => void){
        return new Promise((resolve, reject) => {
            var response = this._responses.shift();

            if (response == null) {
                throw new Error("Expected a response.");
            }

            var connectErrorToThrow = response.connectErrorToThrow;

            setTimeout(() => {

                if (typeof callback === "function") {
                    if (connectErrorToThrow != null) {
                        callback(connectErrorToThrow, null);
                        reject(connectErrorToThrow);
                        return;
                    }

                    var mongo = new MongoDB(response);
                    callback(null, mongo);
                    resolve();
                }

            }, 0);
        });
    }

}
