"use strict";
const express = require("express");
const Busboy = require("busboy");
const stream = require("stream");
const entityRouter = express.Router();
entityRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let promiseStarted = false;
    let components = null;
    let content = null;
    let addEntity = () => {
        promiseStarted = true;
        dispatcher.addEntityAsync(content, components).then(result => {
            response.status(200).send({ data: result });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    };
    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        if (fieldName === "components") {
            try {
                components = JSON.parse(value);
            }
            catch (error) {
                response.status(400).send({ message: error.message });
            }
        }
        else if (fieldName === "content") {
            content = new stream.Readable();
            content._read = () => { };
            content.push(value);
            content.push(null);
        }
    });
    busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
        if (fieldName === "content") {
            content = file;
            addEntity();
        }
    });
    busboy.on("finish", () => {
        if (!promiseStarted) {
            addEntity();
        }
    });
    request.pipe(busboy);
});
entityRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const entityId = request.query.id;
    const getCount = request.query.count;
    const lastId = request.query.lastId;
    const pageSize = request.query.pageSize;
    const lastUpdatedDate = request.query.lastUpdatedDate;
    const lastCreatedDate = request.query.lastCreatedDate;
    if (entityId) {
        dispatcher.getEntityByIdAsync(entityId).then(entity => {
            response.status(200).send({ data: entity });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else if (getCount == "true") {
        dispatcher.getEntityCountAsync().then(count => {
            response.status(200).send({ data: { count } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        const config = {
            lastId,
            lastUpdatedDate,
            lastCreatedDate,
            pageSize
        };
        dispatcher.getEntitiesAsync(config).then(entities => {
            response.status(200).send({ data: entities });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
});
entityRouter.patch("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entityForm = {};
    const updateEntity = () => {
        if (entityForm.entity) {
            let entity;
            try {
                entity = JSON.parse(entityForm.entity);
            }
            catch (error) {
                return response.status(400).send({ message: error.message });
            }
            dispatcher.updateEntityAsync(entity).then(entity => {
                response.status(200).send({ data: entity });
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        }
        else {
            response.status(400).send({ message: "An entity was not provided in the body." });
        }
    };
    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        entityForm[fieldName] = value;
    });
    busboy.on("finish", () => {
        updateEntity();
    });
    request.pipe(busboy);
});
entityRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const entityId = request.query.id;
    if (entityId) {
        dispatcher.getEntityByIdAsync(entityId).then(entity => {
            return dispatcher.removeEntityAsync(entity).then(() => {
                response.status(200).send({ data: entity });
            });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        response.status(400).send({ message: "The id of the entity to be deleted was not provided as a parameter." });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = entityRouter;
//# sourceMappingURL=Entities.js.map