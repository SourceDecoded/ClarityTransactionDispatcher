"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Busboy = require("busboy");
const stream = require("stream");
const entityRouter = express.Router();
entityRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entity;
    let result = {
        entity: null,
        components: []
    };
    let savingPromise = dispatcher.addEntityAsync().then((dispatcherResult) => {
        entity = dispatcherResult.entity;
        result.entity = dispatcherResult.entity;
    }).catch((error) => {
        response.status(500).send({ message: error.message });
    });
    let removeEntityAsync = (error) => {
        response.status(500).send({ message: error.message });
        return dispatcher.removeEntityAsync(entity).catch((error) => {
            dispatcher.logError(error);
        });
    };
    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        if (fieldName === "components") {
            try {
                var components = JSON.parse(value);
                savingPromise = savingPromise.then(() => {
                    var componentsPromises = components.map((component) => {
                        return dispatcher.addComponentAsync(entity, component).then((savedComponent) => {
                            result.components.push(savedComponent);
                        });
                    });
                    return Promise.all(componentsPromises);
                }).catch((error) => {
                    return removeEntityAsync(error);
                });
            }
            catch (error) {
                response.status(400).send({ message: error.message });
            }
        }
        else if (fieldName === "content") {
            var contentStream = new stream.Readable();
            contentStream._read = () => { };
            contentStream.push(value);
            contentStream.push(null);
            savingPromise = savingPromise.then(() => {
                return dispatcher.updateEntityContentByStreamAsync(entity, contentStream);
            }).then((entity) => {
                result.entity.content_id = entity.content_id;
            });
        }
    });
    busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
        if (fieldName === "content") {
            savingPromise = savingPromise.then(() => {
                return dispatcher.updateEntityContentByStreamAsync(entity, file);
            }).then((entity) => {
                result.entity.content_id = entity.content_id;
            }).catch((error) => {
                return removeEntityAsync(error);
            });
        }
    });
    busboy.on("finish", () => {
        savingPromise.then(() => {
            response.status(200).send({ data: result });
        });
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
exports.default = entityRouter;
//# sourceMappingURL=Entities.js.map