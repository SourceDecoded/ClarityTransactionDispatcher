import { IMongoCursor } from "./../library/interfaces";

export default class MongoCursor implements IMongoCursor {
    private _config: {
        collectionMethodErrorToThrow: any;
        collectionMethodResult: Array<any>;
    };

    constructor(config: {
        collectionMethodErrorToThrow: any;
        collectionMethodResult: Array<any>;
    }) {
        this._config = config;
    }

    toArray(callback: (err, results) => void) {
        setTimeout(() => {
            if (this._config.collectionMethodErrorToThrow != null) {
                callback(this._config.collectionMethodErrorToThrow, null);
            } else {
                callback(null, this._config.collectionMethodResult);
            }
        });
    }
}