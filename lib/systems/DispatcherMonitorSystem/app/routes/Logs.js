"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require("express");

var express = _interopRequireWildcard(_express);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var logRouter = express.Router();

logRouter.get("/", function (request, response) {
    var dispatcherMonitor = response.locals.dispatcherMonitor;
    var lastId = request.query.lastId === "0" ? null : request.query.lastId;
    var pageSize = request.query.pageSize;

    dispatcherMonitor.getLogsAsync({ lastId: lastId, pageSize: pageSize }).then(function (logs) {
        response.status(200).send(logs);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

logRouter.get("/:id", function (request, response) {
    var dispatcherMonitor = response.locals.dispatcherMonitor;
    var logId = request.params.id;

    dispatcherMonitor.getLogByIdAsync(logId).then(function (log) {
        response.status(200).send(log);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

exports.default = logRouter;
//# sourceMappingURL=Logs.js.map