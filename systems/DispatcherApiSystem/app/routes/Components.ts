import * as express from "express";

const componentRouter = express.Router();

componentRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    
    response.status(200).json({
        message: "Get Component"
    });
});

componentRouter.post("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    
    response.status(200).json({
        message: "Post Component"
    });
});

componentRouter.patch("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;

    response.status(200).json({
        message: "Patch Component"
    });
});

componentRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;

    response.status(200).json({
        message: "Delete Component"
    });
});

export default componentRouter;