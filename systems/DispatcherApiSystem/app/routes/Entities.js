"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const entityRouter = express.Router();
const jsonParser = bodyParser.json();
entityRouter.post("/", jsonParser, (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const entity = request.body.entity;
    if (entity) {
        dispatcher.addEntityAsync(entity).then(createdEntity => {
            response.status(200).send(createdEntity);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        response.status(400).send({ message: "The following field(s) are required in the body of the request: entity." });
    }
});
entityRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const lastId = request.query.lastId;
    if (lastId) {
        dispatcher.getEntitiesAsync({ lastId }).then(entities => {
            response.status(200).send(entities);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        response.status(400).send({ message: "The following parameter(s) are required in the request url: lastId." });
    }
});
entityRouter.get("/:id", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const id = request.params.id;
    dispatcher.getEntityByIdAsync(id).then(entity => {
        response.status(200).send(entity);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});
entityRouter.patch("/:id", jsonParser, (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const id = request.params.id;
    const entity = request.body.entity;
    if (entity) {
        entity._id = id;
        dispatcher.updateEntityAsync(entity).then(updatedEntity => {
            response.status(200).send(updatedEntity);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        response.status(400).send({ message: "The following field(s) are required in the body of the request: entity." });
    }
});
entityRouter.delete("/:id", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const id = request.params.id;
    dispatcher.getEntityByIdAsync(id).then(entity => {
        return dispatcher.removeEntityAsync(entity);
    }).then((removedEntity) => {
        response.status(200).send(removedEntity);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});
entityRouter.get("/:id/components", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const id = request.params.id;
    dispatcher.getEntityByIdAsync(id).then(entity => {
        response.status(200).send(entity.components);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});
entityRouter.get("/:entityId/components/:componentId", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const entityId = request.params.entityId;
    const componentId = request.params.componentId;
    const getFile = request.query.getFile;
    if (getFile === "true") {
    }
    else {
        dispatcher.getEntityByIdAsync(entityId).then(entity => {
            const component = entity.components.filter(component => component._id == componentId);
            if (component[0]) {
                response.status(200).send(component);
            }
            else {
                response.status(400).send({ message: "The entity provided does not have a component with that id." });
            }
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
});
entityRouter.post("/:id/components", jsonParser, (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const id = request.params.id;
    const component = request.body.component;
    if (component) {
        dispatcher.getEntityByIdAsync(id).then(entity => {
            entity._id = id;
            entity.components.push(component);
            return dispatcher.updateEntityAsync(entity);
        }).then(updatedEntity => {
            response.status(200).send(updatedEntity);
        }).catch(error => {
            response.status(400).send(error.message);
        });
    }
    else {
        response.status(400).send({ message: "The following field(s) are required in the body of the request: component." });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = entityRouter;
//# sourceMappingURL=Entities.js.map