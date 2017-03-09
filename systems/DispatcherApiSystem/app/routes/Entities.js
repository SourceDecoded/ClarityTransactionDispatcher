"use strict";
const express = require("express");
const Busboy = require("busboy");
// TODO: Handle streaming content
const entityRouter = express.Router();
entityRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entityForm = {};
    const addEntity = () => {
        const components = entityForm.components ? JSON.parse(entityForm.components) : [];
        const id = entityForm.id || null;
        dispatcher.addEntityAsync(null, components, id).then(result => {
            response.status(200).send(result);
        }).catch((error) => {
            response.status(400).send(error);
        });
    };
    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        entityForm[fieldName] = value;
    });
    busboy.on("finish", () => {
        addEntity();
    });
    request.pipe(busboy);
});
entityRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const entityId = request.query.id;
    const getCount = request.query.count;
    if (entityId) {
        dispatcher.getEntityByIdAsync(entityId).then(entity => {
            response.status(200).send(entity);
        }).catch(error => {
            response.status(400).send(error);
        });
    }
    else if (getCount == "true") {
        dispatcher.getEntityCountAsync().then(count => {
            response.status(200).send(count);
        }).catch(error => {
            response.status(400).send(error);
        });
    }
    else {
        response.status(400).send(new Error("Please provide an id or count parameter."));
    }
});
entityRouter.patch("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entityForm = {};
    const updateEntity = () => {
        const entity = JSON.parse(entityForm.entity);
        dispatcher.updateEntityAsync(entity).then(entity => {
            response.status(200).send(entity);
        }).catch(error => {
            response.status(400).send(error);
        });
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
                response.status(200).send(entity);
            });
        }).catch(error => {
            response.status(400).send(error);
        });
    }
    else {
        response.status(400).send(new Error("Please provide the id of the entity to be deleted."));
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = entityRouter;
//# sourceMappingURL=Entities.js.map