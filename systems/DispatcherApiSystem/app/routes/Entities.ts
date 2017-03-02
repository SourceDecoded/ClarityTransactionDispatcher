import * as express from "express";
import Busboy from "busboy";

const entityRouter = express.Router();

entityRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;

    dispatcher.addEntityAsync({}, null, components).then(() => {

    }).catch((error) => {
        response.status(400).send(error);
    });

    response.status(200).json({
        message: "Post Entity"
    });
});

entityRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;

    response.status(200).json({
        message: "Get Entity"
    });
});

entityRouter.patch("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;

    response.status(200).json({
        message: "Patch Entity"
    });
});

entityRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;

    response.status(200).json({
        message: "Delete Entity"
    });
});

export default entityRouter;