"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Uptimes_1 = require("./routes/Uptimes");
const Transactions_1 = require("./routes/Transactions");
const Logs_1 = require("./routes/Logs");
class Router {
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
        this.app.use("/api/uptimes", Uptimes_1.default);
        this.app.use("/api/transactions", Transactions_1.default);
        this.app.use("/api/logs", Logs_1.default);
    }
}
exports.default = Router;
//# sourceMappingURL=Router.js.map