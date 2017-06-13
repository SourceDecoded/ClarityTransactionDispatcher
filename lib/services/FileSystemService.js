"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileSystemService = function () {
    function FileSystemService(config) {
        _classCallCheck(this, FileSystemService);

        this.mongodb = config.mongodb;
        this.MongoClient = this.mongodb.MongoClient;
        this.ObjectID = this.mongodb.ObjectID;
        this.databaseUrl = config.databaseUrl;
        this.GridFs;
    }

    _createClass(FileSystemService, [{
        key: "_getDatabaseAsync",
        value: function _getDatabaseAsync() {
            return this.MongoClient.connect(this.databaseUrl);
        }
    }, {
        key: "_getGridFsAsync",
        value: function _getGridFsAsync() {
            var _this = this;

            return this._getDatabaseAsync().then(function (db) {
                return new _this.GridFs(db, _this.mongodb);
            });
        }
    }, {
        key: "getFileReadStreamByIdAsync",
        value: function getFileReadStreamByIdAsync(id) {
            var _this2 = this;

            return this._getGridFsAsync().then(function (gfs) {
                return gfs.createReadStream({
                    _id: _this2.ObjectID(id)
                });
            }).catch(function (error) {
                throw error;
            });
        }
    }, {
        key: "getFileWriteStreamByIdAsync",
        value: function getFileWriteStreamByIdAsync(id) {
            var newFileId = id ? this.ObjectID(id) : this.ObjectID();

            return this._getGridFsAsync().then(function (gfs) {
                return gfs.createWriteStream({
                    _id: id
                });
            }).catch(function (error) {
                throw error;
            });
        }
    }, {
        key: "removeFileByIdAsync",
        value: function removeFileByIdAsync(id) {
            return this._getGridFsAsync().then(function (gfs) {
                return new Promise(function (resolve, reject) {
                    gfs.remove({
                        _id: id
                    }, function (error) {
                        if (error != null) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        }
    }]);

    return FileSystemService;
}();

exports.default = FileSystemService;
//# sourceMappingURL=FileSystemService.js.map