import * as express from "express";

const transactionRouter = express.Router();

transactionRouter.get("/", (request, response) => {
    const monitor = response.locals.monitor;
});

export default transactionRouter;