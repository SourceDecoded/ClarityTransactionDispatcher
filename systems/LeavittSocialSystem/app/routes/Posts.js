"use strict";
const express = require("express");
const postsRouter = express.Router();
postsRouter.get("/", (request, response) => {
    const system = response.locals.system;
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = postsRouter;
//# sourceMappingURL=Posts.js.map