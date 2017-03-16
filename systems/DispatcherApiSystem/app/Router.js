"use strict";
const Entities_1 = require("./routes/Entities");
const Components_1 = require("./routes/Components");
const Content_1 = require("./routes/Content");
class Router {
    constructor(app, clarityTransactionDispatcher) {
        this.app = clarityTransactionDispatcher.getService("express");
        this.authenticator = clarityTransactionDispatcher.getService("authenticator");
        this.clarityTransactionDispatcher = clarityTransactionDispatcher;
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
                    statusCode: null
                };
            }
            catch (error) {
                return {
                    verified: false,
                    message: error.message,
                    statusCode: 401
                };
            }
        }
        return {
            verified: true,
            message: null,
            statusCode: null
        };
    }
    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.locals.clarityTransactionDispatcher = this.clarityTransactionDispatcher;
            response.locals.authenticator = this.authenticator;
            var authenticationResult = this.authenticate(request, response);
            if (authenticationResult.verified) {
                next();
            }
            else {
                response.status(authenticationResult.statusCode).send({ message: authenticationResult.message });
            }
        });
        this.app.use("/api/entities", Entities_1.default);
        this.app.use("/api/components", Components_1.default);
        this.app.use("/api/content", Content_1.default);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
//# sourceMappingURL=Router.js.map