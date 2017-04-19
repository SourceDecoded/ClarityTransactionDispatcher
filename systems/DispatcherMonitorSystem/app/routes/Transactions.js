"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const transactionRouter = express.Router();
transactionRouter.get("/", (request, response) => {
    const dispatcherMonitor = response.locals.dispatcherMonitor;
    const getCount = request.query.getCount;
    const lastId = request.query.lastId;
    const pageSize = request.query.pageSize;
    let filter = request.query.filter;
    if (filter) {
        try {
            filter = JSON.parse(filter);
        }
        catch (error) {
            return response.status(400).send({ message: error.message });
        }
    }
    if (getCount === "true") {
        dispatcherMonitor.getTransactionCountAsync(filter).then(count => {
            response.status(200).send(count.toString());
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        dispatcherMonitor.getTransactionsAsync({ lastId, pageSize }).then(transactions => {
            response.status(200).send(transactions);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
});
transactionRouter.get("/:id", (request, response) => {
    const dispatcherMonitor = response.locals.dispatcherMonitor;
    const transactionId = request.params.id;
    dispatcherMonitor.getTransactionByIdAsync(transactionId).then(transaction => {
        response.status(200).send(transaction);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});
exports.default = transactionRouter;
//# sourceMappingURL=Transactions.js.map