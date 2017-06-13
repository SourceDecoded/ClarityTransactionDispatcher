import * as express from "express";

const logRouter = express.Router();

logRouter.get("/", (request, response) => {
    const dispatcherMonitor = response.locals.dispatcherMonitor;
    const lastId = request.query.lastId === "0" ? null : request.query.lastId;
    const pageSize = request.query.pageSize;

    dispatcherMonitor.getLogsAsync({ lastId, pageSize }).then(logs => {
        response.status(200).send(logs);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

logRouter.get("/:id", (request, response) => {
    const dispatcherMonitor = response.locals.dispatcherMonitor;
    const logId = request.params.id;

    dispatcherMonitor.getLogByIdAsync(logId).then(log => {
        response.status(200).send(log);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

export default logRouter;