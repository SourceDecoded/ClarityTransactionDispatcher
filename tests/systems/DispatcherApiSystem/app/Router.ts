import entitiesRoute from "./routes/Entities";
import componentsRoute from "./routes/Components";
import contentRoute from "./routes/Content";

export default class Router {
    app: any;
    clarityTransactionDispatcher: any;

    constructor(app, clarityTransactionDispatcher) {
        this.app = app;
        this.clarityTransactionDispatcher = clarityTransactionDispatcher;
    }

    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.locals.clarityTransactionDispatcher = this.clarityTransactionDispatcher;
            next();
        });

        this.app.use("/api/entities", entitiesRoute);
        this.app.use("/api/components", componentsRoute);
        this.app.use("/api/content", contentRoute);
    }
}