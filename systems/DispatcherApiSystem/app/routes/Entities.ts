import * as express from "express";
import * as Busboy from "busboy";
import * as bodyParser from "body-parser";
import ClarityTransactionDispatcher from "./../../../../library/ClarityTransactionDispatcher";

const entityRouter = express.Router();
const jsonParser = bodyParser.json();

entityRouter.post("/", jsonParser, (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entity = request.body;

    dispatcher.addEntityAsync(entity).then(createdEntity => {
        response.status(200).send(createdEntity);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.get("/", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const lastId = request.query.lastId;
    const pageSize = request.query.pageSize;
    const lastModifiedDate = request.query.lastModifiedDate;
    const lastCreatedDate = request.query.lastCreatedDate;
    const getCount = request.query.getCount;

    if (getCount !== "true") {
        dispatcher.getEntitiesAsync({ lastId, pageSize, lastModifiedDate, lastCreatedDate }).then(entities => {
            response.status(200).send(entities);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        dispatcher.getEntityCountAsync().then(count => {
            response.status(200).send(count.toString());
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
});

entityRouter.get("/:id", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.id;

    dispatcher.getEntityByIdAsync(entityId).then(entity => {
        response.status(200).send(entity);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.patch("/:id", jsonParser, (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.id;
    const entity = request.body;

    api.updateEntityAsync(entityId, entity).then(updatedEntity => {
        response.status(200).send(updatedEntity);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.delete("/:id", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.id;

    api.removeEntityByIdAsync(entityId).then((removedEntity) => {
        response.status(200).send(removedEntity);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.get("/:id/components", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.id;

    api.getComponentsByEntityIdAsync(entityId).then(components => {
        response.status(200).send(components);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.get("/:entityId/components/:componentId", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const fileSystem = response.locals.fileSystem;
    const entityId = request.params.entityId;
    const componentId = request.params.componentId;
    const getFile = request.query.getFile;

    api.getComponentAsync(componentId, entityId).then(component => {
        if (getFile === "true") {
            return fileSystem.getFileReadStreamByIdAsync(component.fileId).then(fileStream => {
                try {
                    fileStream.read();
                } catch (error) {
                    throw error;
                }

                response.set("Content-Type", component.contentType);
                response.set("Content-Length", component.contentLength);

                fileStream.pipe(response);
            });
        } else {
            response.status(200).send(component);
        }
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.post("/:id/components", jsonParser, (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.id;

    const addJsonComponent = () => {
        const component = request.body;

        api.addComponentAsync(entityId, component).then(newComponent => {
            response.status(200).send(newComponent);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    };

    const addFileComponent = () => {
        const busboy = new Busboy({ headers: request.headers });

        busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
            api.addFileAsync(file).then(data => {
                const component = {
                    fileId: data.fileId,
                    fileName,
                    contentType: mimeType,
                    contentLength: data.contentLength,
                    type: "file"
                };

                return api.addComponentAsync(entityId, component);
            }).then(newComponent => {
                response.status(200).send(newComponent);
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        });

        busboy.on("error", error => {
            response.status(400).send({ message: error.message });
        });

        request.pipe(busboy);
    };

    if (request.headers["content-type"] === "application/json") {
        addJsonComponent();
    } else {
        addFileComponent();
    }
});

entityRouter.patch("/:entityId/components/:componentId", jsonParser, (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.entityId;
    const componentId = request.params.componentId;

    const updateJsonComponent = () => {
        const component = request.body;

        api.updateComponentAsync(componentId, entityId, component).then(updatedComponent => {
            response.status(200).send(updatedComponent);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    };

    const updateFileComponent = () => {
        const busboy = new Busboy({ headers: request.headers });

        busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
            api.addFileAsync(file).then(data => {
                const component = {
                    fileId: data.fileId,
                    fileName,
                    contentType: mimeType,
                    contentLength: data.contentLength,
                    type: "file"
                };

                return api.updateComponentAsync(componentId, entityId, component);
            }).then(updatedComponent => {
                response.status(200).send(updatedComponent);
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        });

        busboy.on("error", error => {
            response.status(400).send({ message: error.message });
        });

        request.pipe(busboy);
    };

    if (request.headers["content-type"] === "application/json") {
        updateJsonComponent();
    } else {
        updateFileComponent();
    }
});

entityRouter.delete("/:entityId/components/:componentId", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.entityId;
    const componentId = request.params.componentId;

    api.removeComponentAsync(componentId, entityId).then((removedComponent) => {
        response.status(200).send(removedComponent);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

export default entityRouter;