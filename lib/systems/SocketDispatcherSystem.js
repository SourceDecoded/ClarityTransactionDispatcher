"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SocketDispatcherSystem = function () {
    function SocketDispatcherSystem(config) {
        _classCallCheck(this, SocketDispatcherSystem);

        this._name = "RemoteDispatcherSystem";
        this._guid = "b42ea3d4-1ef6-4f00-8630-298366160df8";

        if (config == null) {
            throw new Error("Needs to provide a socket and a socket stream.");
        }

        if (config.socket == null) {
            throw new Error("Needs to provide a socket to pipe to.");
        }

        if (config.socketStream == null) {
            throw new Error("Needs to provide a socket stream.");
        }

        this._socketStream = config.socketStream;
        this._socket = config.socket;
        this._socketStreamInstance = this._socketStream(this._socket);
    }

    _createClass(SocketDispatcherSystem, [{
        key: "_buildMethodAsync",
        value: function _buildMethodAsync(methodName) {
            var _this = this,
                _arguments = arguments;

            this._socket.on(methodName, function (data) {
                if (data.id != null && Array.isArray(data.arguments)) {
                    _this._clarityTransactionDispatcher[methodName].apply(_this._clarityTransactionDispatcher, _arguments).then(function (response) {
                        _this._respond(data.id, response);
                    }).catch(function (error) {
                        _this._respondByError(data.id, error);
                    });
                }
            });
        }
    }, {
        key: "_buildMethod",
        value: function _buildMethod(methodName) {
            var _this2 = this,
                _arguments2 = arguments;

            this._socket.on(methodName, function (data) {
                if (data.id != null && Array.isArray(data.arguments)) {
                    try {
                        _this2._respond(data.id, _this2._clarityTransactionDispatcher[methodName].apply(_this2._clarityTransactionDispatcher, _arguments2));
                    } catch (error) {
                        _this2._respondByError(data.id, error);
                    }
                }
            });
        }
    }, {
        key: "_buildReturnStreamMethodAsync",
        value: function _buildReturnStreamMethodAsync(methodName) {
            var _this3 = this,
                _arguments3 = arguments;

            this._socket.on(methodName, function (data) {
                if (data.id != null && Array.isArray(data.arguments)) {
                    _this3._clarityTransactionDispatcher[methodName].apply(_this3._clarityTransactionDispatcher, _arguments3).then(function (response) {
                        _this3._respond(data.id, response);
                    }).catch(function (error) {
                        _this3._respondByError(data.id, error);
                    });
                }
            });
        }
    }, {
        key: "_buildSocketInterface",
        value: function _buildSocketInterface() {
            this._buildMethodAsync("addComponentAsync");
            this._buildMethodAsync("addEntityAsync");
            this._buildMethodAsync("approveComponentRemovalAsync");
            this._buildMethodAsync("approveEntityRemovalAsync");
            this._buildMethodAsync("getComponentByIdAsync");
            this._buildMethodAsync("getComponentsByEntityAndTypeAsync");
            this._buildMethodAsync("getComponentsByEntityAsync");
            this._buildMethodAsync("getEntityByIdAsync");
            this._buildMethodAsync("getEntities");
            this._buildMethodAsync("getEntityByIdAsync");
            this._buildMethodAsync("getEntityContentStreamByContentIdAsync");
            this._buildMethodAsync("getEntityContentStreamByEntityAsync");
            this._buildMethod("logError");
            this._buildMethod("logMessage");
            this._buildMethod("logWarning");
            this._buildMethodAsync("removeComponentAsync");
            this._buildMethodAsync("removeEntityAsync");
            this._buildMethodAsync("removeEntityContentAsync");
            this._buildMethodAsync("updateComponentAsync");
            this._buildMethodAsync("updateEntityAsync");
            this._buildMethodAsync("validateComponentAsync");
            this._buildMethodAsync("validateEntityAsync");
            this._buildMethodAsync("validateEntityContentAsync");
        }
    }, {
        key: "_respond",
        value: function _respond(id, response) {
            this._socket.emit("response", {
                id: id,
                response: response,
                error: null
            });
        }
    }, {
        key: "_respondByError",
        value: function _respondByError(id, error) {
            this._socket.emit("response", {
                id: id,
                response: null,
                error: {
                    message: error.message
                }
            });
        }
    }, {
        key: "activatedAsync",
        value: function activatedAsync(clarityTransactionDispatcher) {}
    }, {
        key: "approveComponentRemovalAsync",
        value: function approveComponentRemovalAsync(component) {}
    }, {
        key: "approveEntityRemovalAsync",
        value: function approveEntityRemovalAsync(entity) {}
    }, {
        key: "deactivatedAsync",
        value: function deactivatedAsync(clarityTransactionDispatcher) {}
    }, {
        key: "disposeAsync",
        value: function disposeAsync(clarityTransactionDispatcher) {}
    }, {
        key: "entityAddedAsync",
        value: function entityAddedAsync(entity) {}
    }, {
        key: "entityUpdatedAsync",
        value: function entityUpdatedAsync(oldEntity, newEntity) {}
    }, {
        key: "entityRemovedAsync",
        value: function entityRemovedAsync(entity) {}
    }, {
        key: "entityRetrievedAsync",
        value: function entityRetrievedAsync(entity) {}
    }, {
        key: "entityContentUpdatedAsync",
        value: function entityContentUpdatedAsync(oldContentId, newContentId) {}
    }, {
        key: "entityComponentAddedAsync",
        value: function entityComponentAddedAsync(entity, component) {}
    }, {
        key: "entityComponentUpdatedAsync",
        value: function entityComponentUpdatedAsync(entity, oldComponent, newComponent) {}
    }, {
        key: "entityComponentRemovedAsync",
        value: function entityComponentRemovedAsync(entity, component) {}
    }, {
        key: "entityComponentRetrievedAsync",
        value: function entityComponentRetrievedAsync(entity, component) {}
    }, {
        key: "getName",
        value: function getName() {}
    }, {
        key: "getGuid",
        value: function getGuid() {}
    }, {
        key: "initializeAsync",
        value: function initializeAsync(clarityTransactionDispatcher) {
            this._clarityTransactionDispatcher = clarityTransactionDispatcher;
        }
    }, {
        key: "serviceRemovedAsync",
        value: function serviceRemovedAsync(name, service) {}
    }, {
        key: "validateEntityAsync",
        value: function validateEntityAsync(entity) {}
    }, {
        key: "validateComponentAsync",
        value: function validateComponentAsync(component) {}
    }, {
        key: "validateEntityContentAsync",
        value: function validateEntityContentAsync(entity, oldContentId, newContentId) {}
    }]);

    return SocketDispatcherSystem;
}();

exports.default = SocketDispatcherSystem;
//# sourceMappingURL=SocketDispatcherSystem.js.map