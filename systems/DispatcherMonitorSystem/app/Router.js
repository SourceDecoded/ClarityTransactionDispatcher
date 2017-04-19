"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Uptimes_1 = require("./routes/Uptimes");
const Transactions_1 = require("./routes/Transactions");
const Logs_1 = require("./routes/Logs");
class Router {
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
        this.app.use("/api/uptimes", Uptimes_1.default);
        this.app.use("/api/transactions", Transactions_1.default);
        this.app.use("/api/logs", Logs_1.default);
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
exports.default = Router;
//# sourceMappingURL=Router.js.map