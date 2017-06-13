"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require("express");

var express = _interopRequireWildcard(_express);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var uptimeRouter = express.Router();

uptimeRouter.get("/", function (request, response) {
    var dispatcherMonitor = response.locals.dispatcherMonitor;
    var getLatest = request.query.getLatest;
    var lastId = request.query.lastId;
    var pageSize = request.query.pageSize;

    if (getLatest === "true") {
        dispatcherMonitor.getLatestUptimeAsync().then(function (uptime) {
            response.status(200).send(uptime);
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    } else {
        dispatcherMonitor.getUptimesAsync({ lastId: lastId, pageSize: pageSize }).then(function (uptimes) {
            response.status(200).send(uptimes);
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    }
});

exports.default = uptimeRouter;
//# sourceMappingURL=Uptimes.js.map