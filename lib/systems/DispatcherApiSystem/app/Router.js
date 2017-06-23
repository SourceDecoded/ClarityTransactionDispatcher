"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Entities = require("./routes/Entities");

var _Entities2 = _interopRequireDefault(_Entities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Router = function () {
    function Router(dispatcherApi) {
        _classCallCheck(this, Router);

        this.app = dispatcherApi.clarityTransactionDispatcher.getService("express");
        this.authenticator = dispatcherApi.clarityTransactionDispatcher.getService("authenticator");
        this.fileSystem = dispatcherApi.clarityTransactionDispatcher.getService("fileSystem");
        this.clarityTransactionDispatcher = dispatcherApi.clarityTransactionDispatcher;
        this.dispatcherApi = dispatcherApi;
    }

    _createClass(Router, [{
        key: "getToken",
        value: function getToken(authorizationHeader) {
            var parts = authorizationHeader.split(" ");
            return parts[parts.length - 1].trim();
        }
    }, {
        key: "authenticate",
        value: function authenticate(request, response) {
            if (this.authenticator != null) {
                try {
                    var token = this.authenticator.decode(this.getToken(request.get("Authorization")));

                    return {
                        verified: true,
                        message: null,
                        statusCode: null,
                        token: token
                    };
                } catch (error) {
                    return {
                        verified: false,
                        message: error.message,
                        token: null,
                        statusCode: 401
                    };
                }
            }
            return {
                verified: true,
                message: null,
                token: null,
                statusCode: null
            };
        }
    }, {
        key: "init",
        value: function init() {
            var _this = this;

            this.app.use(function (request, response, next) {
                response.header("Access-Control-Allow-Origin", "*");
                response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
                response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
                response.locals.dispatcherApi = _this.dispatcherApi;
                response.locals.authenticator = _this.authenticator;
                response.locals.fileSystem = _this.fileSystem;

                var authenticationResult = _this.authenticate(request, response);

                if (authenticationResult.verified) {
                    response.locals.token = authenticationResult.token;
                    next();
                } else {
                    response.status(authenticationResult.statusCode).send({ message: authenticationResult.message });
                }
            });

            this.app.use("/api/entities", _Entities2.default);

            this.app.use(function (error, request, response, next) {
                if (error) {
                    response.status(400).send({ message: error.message });
                } else {
                    next();
                }
            });
        }
    }]);

    return Router;
}();

exports.default = Router;
//# sourceMappingURL=Router.js.map