import * as express from "express";

const postsRouter = express.Router();

postsRouter.get("/", (request, response) => {
    const system = response.locals.system;

});

export default postsRouter;