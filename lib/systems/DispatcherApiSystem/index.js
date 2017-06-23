"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Router = require("./app/Router");

var _Router2 = _interopRequireDefault(_Router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DispatcherApiSystem = function () {
    function DispatcherApiSystem() {
        _classCallCheck(this, DispatcherApiSystem);

        this.clarityTransactionDispatcher = null;
        this.app = null;
        this.guid = "13CE560D-9B85-4C85-8BA4-72EA1686EBAA";
        this.name = "Dispatcher Api System";
        this.authenticator = null;
        this.fileSystem = null;
    }

    _createClass(DispatcherApiSystem, [{
        key: "_initAPI",
        value: function _initAPI() {
            var router = new _Router2.default(this);
            router.init();
        }
    }, {
        key: "activatedAsync",
        value: function activatedAsync(clarityTransactionDispatcher) {
            this.clarityTransactionDispatcher = clarityTransactionDispatcher;
            this.fileSystem = this.clarityTransactionDispatcher.getService("fileSystem");
            this._initAPI();
        }
    }, {
        key: "addComponentAsync",
        value: function addComponentAsync(entityId, component) {
            var _this = this;

            return this.clarityTransactionDispatcher.getEntityByIdAsync(entityId).then(function (entity) {
                entity.components.push(component);
                return _this.clarityTransactionDispatcher.updateEntityAsync(entity);
            }).then(function (updatedEntity) {
                return Promise.resolve(updatedEntity.components.slice(-1)[0]);
            });
        }
    }, {
        key: "addFileAsync",
        value: function addFileAsync(file) {
            var fileId = this.clarityTransactionDispatcher.ObjectID();

            return this.fileSystem.getFileWriteStreamByIdAsync(fileId).then(function (writeStream) {
                return new Promise(function (resolve, reject) {
                    var contentLength = 0;

                    file.on("data", function (data) {
                        contentLength += data.length;
                    });

                    file.on("end", function () {
                        resolve({ contentLength: contentLength, fileId: fileId });
                    });

                    file.on("error", function (error) {
                        reject(error);
                    });

                    file.pipe(writeStream);
                });
            });
        }
    }, {
        key: "getGuid",
        value: function getGuid() {
            return this.guid;
        }
    }, {
        key: "getName",
        value: function getName() {
            return this.name;
        }
    }, {
        key: "getComponentsByEntityIdAsync",
        value: function getComponentsByEntityIdAsync(id) {
            return this.clarityTransactionDispatcher.getEntityByIdAsync(id).then(function (entity) {
                return Promise.resolve(entity.components);
            });
        }
    }, {
        key: "getComponentAsync",
        value: function getComponentAsync(componentId, entityId) {
            return this.getComponentsByEntityIdAsync(entityId).then(function (components) {
                var component = components.filter(function (component) {
                    return component._id == componentId;
                })[0];

                if (component) {
                    return Promise.resolve(component);
                } else {
                    return Promise.reject(new Error("The entity provided does not have a component with that id."));
                }
            });
        }
    }, {
        key: "removeComponentAsync",
        value: function removeComponentAsync(componentId, entityId) {
            var _this2 = this;

            var removedComponent = void 0;

            return this.clarityTransactionDispatcher.getEntityByIdAsync(entityId).then(function (entity) {
                var componentIndex = entity.components.findIndex(function (component) {
                    return component._id == componentId;
                });

                if (componentIndex !== -1) {
                    removedComponent = entity.components.splice(componentIndex, 1);
                } else {
                    return Promise.reject(new Error("The entity provided does not have a component with that id."));
                }

                return _this2.clarityTransactionDispatcher.updateEntityAsync(entity);
            }).then(function () {
                return Promise.resolve(removedComponent);
            });
        }
    }, {
        key: "removeEntityByIdAsync",
        value: function removeEntityByIdAsync(id) {
            var _this3 = this;

            return this.clarityTransactionDispatcher.getEntityByIdAsync(id).then(function (entity) {
                return _this3.clarityTransactionDispatcher.removeEntityAsync(entity);
            });
        }
    }, {
        key: "updateEntityAsync",
        value: function updateEntityAsync(entityId, entity) {
            var _this4 = this;

            return this.clarityTransactionDispatcher.getEntityByIdAsync(entityId).then(function (originalEntity) {
                entity._id = originalEntity._id;
                entity.createdDate = originalEntity.createdDate;
                return Object.assign({}, originalEntity, entity);
            }).then(function (newEntity) {
                return _this4.clarityTransactionDispatcher.updateEntityAsync(newEntity);
            });
        }
    }, {
        key: "updateComponentAsync",
        value: function updateComponentAsync(componentId, entityId, component) {
            var _this5 = this;

            var newComponent = void 0;

            return this.getComponentAsync(componentId, entityId).then(function (oldComponent) {
                component._id = oldComponent._id;
                newComponent = Object.assign({}, oldComponent, component);

                return _this5.clarityTransactionDispatcher.getEntityByIdAsync(entityId);
            }).then(function (entity) {
                var componentIndex = entity.components.findIndex(function (component) {
                    return component._id == componentId;
                });
                entity.components[componentIndex] = newComponent;

                return _this5.clarityTransactionDispatcher.updateEntityAsync(entity);
            }).then(function (updatedEntity) {
                return _this5.getComponentAsync(componentId, entityId);
            });
        }
    }]);

    return DispatcherApiSystem;
}();

exports.default = DispatcherApiSystem;
//# sourceMappingURL=index.js.map