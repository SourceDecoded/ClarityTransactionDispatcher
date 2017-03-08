import * as express from "express";
import * as Busboy from "busboy";

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
    } else if (filter && count == "true") {
        return monitor._getDatabaseAsync().then((db: any) => {
            db.collection("transactions").then((collection: any) => {
                collection.find(filter).count(total => {
                    response.status(200).json({
                        message: "Found total number of transactions!",
                        count: total
                    });
                })
            })
        }).catch(error => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
        });
    }
});

export default transactionRouter;