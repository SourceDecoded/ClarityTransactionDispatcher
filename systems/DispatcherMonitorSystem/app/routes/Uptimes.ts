import * as express from "express";
import * as Busboy from "busboy";

const uptimeRouter = express.Router();

// Parameters: filter=last
uptimeRouter.get("/", (request, response) => {
    const monitor = response.locals.monitor;
    const filter = request.query.filter;

    if (!filter) {
        response.status(400).json({
            message: "Please provide a filter parameter."
        });
    } else {
        if (filter === "last") {
            return monitor._getDatabaseAsync().then((db: any) => {
                db.collection("uptimes", (err, collection) => {
                    if (err != null) {
                        response.status(400).json({
                            message: "ERROR!",
                            error: err
                        });;
                    } else {
                        collection.findOne({}, { sort: { $natural: -1 } }, function (error, item) {
                            if (error != null) {
                                response.status(400).json({
                                    message: "ERROR!",
                                    error: error
                                });;
                            } else {
                                response.status(200).json({
                                    message: "Uptime Found!",
                                    uptime: item
                                });
                            }
                        });
                    }
                })
            });
        } else {
            response.status(400).json({
                message: "Last is currently the only supported filter."
            });;
        }
    }
});

export default uptimeRouter;