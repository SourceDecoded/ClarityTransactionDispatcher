import postsRoute from "./routes/Posts";

export default class Router {
    app: any;
    system: any;

    constructor(app, system) {
        this.app = app;
        this.system = system;
    }

    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.locals.system = this.system;
            next();
        });

        this.app.use("/api/posts", postsRoute);
    }
}