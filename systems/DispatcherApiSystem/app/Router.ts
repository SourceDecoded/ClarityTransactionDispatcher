import entitiesRoute from "./routes/Entities";

export default class Router {
    app: any;

    constructor(app: any) {
        this.app = app;
    }

    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            next();
        });

        this.app.use("/api/entities", entitiesRoute);
    }
}