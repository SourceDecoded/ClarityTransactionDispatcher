"use strict";
const express = require("express");
const transactionRouter = express.Router();
// Parameters: filter
transactionRouter.get("/", (request, response) => {
    const monitor = response.locals.monitor;
    const filter = request.query.filter;
    const count = request.query.count;
    if (!filter) {
        response.status(400).json({
            message: "Please provide a filter parameter."
        });
    }
    else if (filter && count == "true") {
        return monitor._getDatabaseAsync().then((db) => {
            db.collection("transactions").then((collection) => {
                collection.find(filter).count(total => {
                    response.status(200).json({
                        message: "Found total number of transactions!",
                        count: total
                    });
                });
            });
        }).catch(error => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });
            ;
        });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = transactionRouter;
//# sourceMappingURL=Transactions.js.map