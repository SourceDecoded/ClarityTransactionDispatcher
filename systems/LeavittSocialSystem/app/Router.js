"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Posts_1 = require("./routes/Posts");
class Router {
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
        this.app.use("/api/posts", Posts_1.default);
    }
}
exports.default = Router;
//# sourceMappingURL=Router.js.map