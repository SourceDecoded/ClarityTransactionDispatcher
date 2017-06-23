import uptimesRoute from "./routes/Uptimes";
import transactionsRoute from "./routes/Transactions";
import logsRoute from "./routes/Logs";

export default class Router {
    constructor(app, dispatcherMonitor) {
        this.app = app;
        this.dispatcherMonitor = dispatcherMonitor;
    }

    init() {
        this.app.use((request, response, next) => {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.locals.dispatcherMonitor = this.dispatcherMonitor;
            next();
        });

        this.app.use("/api/uptimes", uptimesRoute);
        this.app.use("/api/transactions", transactionsRoute);
        this.app.use("/api/logs", logsRoute);

        this.app.use((error, request, response, next) => {
            if (error) {
                response.status(400).send({ message: error.message });
            } else {
                next();
            }
        });
    }
}