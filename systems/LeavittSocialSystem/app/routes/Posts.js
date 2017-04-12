"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const postsRouter = express.Router();
postsRouter.get("/", (request, response) => {
    const system = response.locals.system;
});
exports.default = postsRouter;
//# sourceMappingURL=Posts.js.map