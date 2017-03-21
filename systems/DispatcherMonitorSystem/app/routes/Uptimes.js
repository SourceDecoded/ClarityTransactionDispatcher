"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const uptimeRouter = express.Router();
uptimeRouter.get("/", (request, response) => {
    const monitor = response.locals.monitor;
    monitor.getLatestUptimeAsync().then(uptime => {
        response.status(200).send({ data: { uptime } });
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});
exports.default = uptimeRouter;
//# sourceMappingURL=Uptimes.js.map