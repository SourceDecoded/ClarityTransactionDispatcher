"use strict";
const express = require("express");
const transactionRouter = express.Router();
transactionRouter.get("/", (request, response) => {
    const monitor = response.locals.monitor;
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = transactionRouter;
//# sourceMappingURL=Transactions.js.map