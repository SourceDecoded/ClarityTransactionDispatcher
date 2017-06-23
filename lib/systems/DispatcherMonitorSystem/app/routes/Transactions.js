"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require("express");

var express = _interopRequireWildcard(_express);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var transactionRouter = express.Router();

transactionRouter.get("/", function (request, response) {
    var dispatcherMonitor = response.locals.dispatcherMonitor;
    var getCount = request.query.getCount;
    var lastId = request.query.lastId;
    var pageSize = request.query.pageSize;
    var filter = request.query.filter;

    if (filter) {
        try {
            filter = JSON.parse(filter);
        } catch (error) {
            return response.status(400).send({ message: error.message });
        }
    }

    if (getCount === "true") {
        dispatcherMonitor.getTransactionCountAsync(filter).then(function (count) {
            response.status(200).send(count.toString());
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    } else {
        dispatcherMonitor.getTransactionsAsync({ lastId: lastId, pageSize: pageSize }).then(function (transactions) {
            response.status(200).send(transactions);
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    }
});

transactionRouter.get("/:id", function (request, response) {
    var dispatcherMonitor = response.locals.dispatcherMonitor;
    var transactionId = request.params.id;

    dispatcherMonitor.getTransactionByIdAsync(transactionId).then(function (transaction) {
        response.status(200).send(transaction);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

exports.default = transactionRouter;
//# sourceMappingURL=Transactions.js.map