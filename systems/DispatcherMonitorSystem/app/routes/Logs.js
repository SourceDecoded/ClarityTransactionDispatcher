"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const logRouter = express.Router();
logRouter.get("/", (request, response) => {
    const monitor = response.locals.monitor;
    const logId = request.query.id;
    const lastId = request.query.lastId === "0" ? null : request.query.lastId;
    const pageSize = request.query.pageSize;
    if (logId) {
        monitor.getLogByIdAsync(logId).then(log => {
            response.status(200).send({ data: { log } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        const config = {
            lastId,
            pageSize
        };
        monitor.getLogsAsync(config).then(logs => {
            response.status(200).send({ data: { logs } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
});
exports.default = logRouter;
//# sourceMappingURL=Logs.js.map