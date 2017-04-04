"use strict";
const express = require("express");
const transactionRouter = express.Router();
transactionRouter.get("/", (request, response) => {
    const monitor = response.locals.monitor;
    const transactionId = request.query.id;
    const getCount = request.query.count;
    let filter = request.query.filter;
    if (filter) {
        try {
            filter = JSON.parse(filter);
        }
        catch (error) {
            return response.status(400).send({ message: error.message });
        }
    }
    if (transactionId) {
        monitor.getTransactionByIdAsync(transactionId).then(transaction => {
            response.status(200).send({ data: { transaction } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else if (getCount == "true") {
        monitor.getTransactionCountAsync(filter).then(count => {
            response.status(200).send({ data: { count } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        response.status(400).send({ message: "The id or count parameter needed." });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = transactionRouter;
//# sourceMappingURL=Transactions.js.map