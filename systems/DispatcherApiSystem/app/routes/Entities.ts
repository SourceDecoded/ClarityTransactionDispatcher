import * as express from "express";

const entityRouter = express.Router();

entityRouter.get("/", (request, response) => {
    response.status(200).json({
        message: "Get Entity"
    });
});

entityRouter.post("/", (request, response) => {
    response.status(200).json({
        message: "Post Entity"
    });
});

entityRouter.patch("/", (request, response) => {
    response.status(200).json({
        message: "Patch Entity"
    });
});

entityRouter.delete("/", (request, response) => {
    response.status(200).json({
        message: "Delete Entity"
    });
});

export default entityRouter;