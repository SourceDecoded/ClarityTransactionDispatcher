import uptimesRoute from "./routes/Uptimes";
import transactionsRoute from "./routes/Transactions";

export default class Router {
    app: any;
    monitor: any;

    constructor(app, monitor) {
        this.app = app;
        this.monitor = monitor;
    }

    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.locals.monitor = this.monitor;
            next();
        });

        this.app.use("/api/uptimes", uptimesRoute);
        this.app.use("/api/transactions", transactionsRoute);
    }
}