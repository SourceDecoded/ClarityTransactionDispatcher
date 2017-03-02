"use strict";
const express = require("express");
const entityRouter = express.Router();
entityRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    console.log(dispatcher);
    response.status(200).json({
        message: "Get Entity"
    });
});
entityRouter.post("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    console.log(dispatcher);
    response.status(200).json({
        message: "Post Entity"
    });
});
entityRouter.patch("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    console.log(dispatcher);
    response.status(200).json({
        message: "Patch Entity"
    });
});
entityRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    console.log(dispatcher);
    response.status(200).json({
        message: "Delete Entity"
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = entityRouter;
//# sourceMappingURL=Entities.js.map