import entitiesRoute from "./routes/Entities";
import componentsRoute from "./routes/Components";
import contentRoute from "./routes/Content";

export default class Router {
    app: any;
    authenticator: any;
    clarityTransactionDispatcher: any;

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

    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.locals.clarityTransactionDispatcher = this.clarityTransactionDispatcher;
            response.locals.authenticator = this.authenticator;

            var authenticationResult = this.authenticate(request, response);

            if (authenticationResult.verified) {
                response.locals.token = authenticationResult.token;
                next();
            } else {
                response.status(authenticationResult.statusCode).send({ message: authenticationResult.message });
            }
        });

        this.app.use("/api/entities", entitiesRoute);
        this.app.use("/api/components", componentsRoute);
        this.app.use("/api/content", contentRoute);
    }
}