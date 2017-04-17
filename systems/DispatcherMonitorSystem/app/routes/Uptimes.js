"use strict";
const express = require("express");
const uptimeRouter = express.Router();
uptimeRouter.get("/", (request, response) => {
    const dispatcherMonitor = response.locals.dispatcherMonitor;
    const getLatest = request.query.getLatest;
    const lastId = request.query.lastId;
    const pageSize = request.query.pageSize;
    if (getLatest === "true") {
        dispatcherMonitor.getLatestUptimeAsync().then(uptime => {
            response.status(200).send(uptime);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        dispatcherMonitor.getUptimesAsync({ lastId, pageSize }).then(uptimes => {
            response.status(200).send(uptimes);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uptimeRouter;
//# sourceMappingURL=Uptimes.js.map