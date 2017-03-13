"use strict";
const express = require("express");
const Busboy = require("busboy");
const componentRouter = express.Router();
componentRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let componentForm = {};
    const addComponent = () => {
        if (componentForm.entity && componentForm.component) {
            let entity;
            let component;
            try {
                entity = JSON.parse(componentForm.entity);
                component = JSON.parse(componentForm.component);
            }
            catch (error) {
                return response.status(400).send({ message: error.message });
            }
            dispatcher.addComponentAsync(entity, component).then(component => {
                response.status(200).send({ data: { component } });
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        }
        else {
            response.status(400).send({ message: "An entity and/or component was not provided in the body." });
        }
    };
    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        componentForm[fieldName] = value;
    });
    busboy.on("finish", () => {
        addComponent();
    });
    request.pipe(busboy);
});
componentRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const componentId = request.query.id;
    const getCount = request.query.count;
    if (componentId) {
        dispatcher.getComponentByIdAsync(componentId).then(component => {
            response.status(200).send({ data: { component } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else if (getCount == "true") {
        dispatcher.getComponentCountAsync().then(count => {
            response.status(200).send({ data: { count } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        response.status(400).send({ message: "An id or count parameter was not provided." });
    }
});
componentRouter.patch("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let componentForm = {};
    const updateComponent = () => {
        if (componentForm.component) {
            let component;
            try {
                component = JSON.parse(componentForm.component);
            }
            catch (error) {
                return response.status(400).send({ message: error.message });
            }
            dispatcher.updateComponentAsync(component).then(component => {
                response.status(200).send({ data: { component } });
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        }
        else {
            response.status(400).send({ message: "A component was not provided in the body." });
        }
    };
    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        componentForm[fieldName] = value;
    });
    busboy.on("finish", () => {
        updateComponent();
    });
    request.pipe(busboy);
});
componentRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const componentId = request.query.id;
    if (componentId) {
        dispatcher.getComponentByIdAsync(componentId).then(component => {
            return dispatcher.removeComponentAsync(component).then(() => {
                response.status(200).send({ data: { component } });
            });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
    else {
        response.status(400).send({ message: "The id of the component to be deleted was not provided as a parameter." });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = componentRouter;
//# sourceMappingURL=Components.js.map