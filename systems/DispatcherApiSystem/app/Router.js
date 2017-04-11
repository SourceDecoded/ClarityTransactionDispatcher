"use strict";
const Entities_1 = require("./routes/Entities");
class Router {
    constructor(dispatcherApi) {
        this.app = dispatcherApi.clarityTransactionDispatcher.getService("express");
        this.authenticator = dispatcherApi.clarityTransactionDispatcher.getService("authenticator");
        this.fileSystem = dispatcherApi.clarityTransactionDispatcher.getService("fileSystem");
        this.clarityTransactionDispatcher = dispatcherApi.clarityTransactionDispatcher;
        this.dispatcherApi = dispatcherApi;
    }
    getToken(authorizationHeader) {
        var parts = authorizationHeader.split(" ");
        return parts[parts.length - 1].trim();
    }
    authenticate(request, response) {
        if (this.authenticator != null) {
            try {
                var token = this.authenticator.decode(this.getToken(request.get("Authorization")));
                return {
                    verified: true,
                    message: null,
                    statusCode: null,
                    token: token
                };
            }
            catch (error) {
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
    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.locals.dispatcherApi = this.dispatcherApi;
            response.locals.authenticator = this.authenticator;
            response.locals.fileSystem = this.fileSystem;
            var authenticationResult = this.authenticate(request, response);
            if (authenticationResult.verified) {
                response.locals.token = authenticationResult.token;
                next();
            }
            else {
                response.status(authenticationResult.statusCode).send({ message: authenticationResult.message });
            }
        });
        this.app.use("/api/entities", Entities_1.default);
        this.app.use((error, request, response, next) => {
            if (error) {
                response.status(400).send({ message: error.message });
            }
            else {
                next();
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
//# sourceMappingURL=Router.js.map