"use strict";
const Entities_1 = require("./routes/Entities");
const Components_1 = require("./routes/Components");
class Router {
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
        this.app.use("/api/entities", Entities_1.default);
        this.app.use("/api/components", Components_1.default);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
//# sourceMappingURL=Router.js.map