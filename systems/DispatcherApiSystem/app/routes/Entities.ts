import * as express from "express";
import * as Busboy from "busboy";
import * as bodyParser from "body-parser";
import ClarityTransactionDispatcher from "./../../../../library/ClarityTransactionDispatcher";

const entityRouter = express.Router();
const jsonParser = bodyParser.json();

entityRouter.post("/", jsonParser, (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entity = request.body.entity;

    if (entity) {
        dispatcher.addEntityAsync(entity).then(createdEntity => {
            response.status(200).send(createdEntity);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        response.status(400).send({ message: "The following field(s) are required in the body of the request: entity." });
    }
});

entityRouter.get("/", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const lastId = request.query.lastId;

    if (lastId) {
        dispatcher.getEntitiesAsync({ lastId }).then(entities => {
            response.status(200).send(entities);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        response.status(400).send({ message: "The following parameter(s) are required in the request url: lastId." });
    }
});

entityRouter.get("/:id", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const id = request.params.id;

    dispatcher.getEntityByIdAsync(id).then(entity => {
        response.status(200).send(entity);
    }).catch(error => {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.patch("/:id", jsonParser, (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const id = request.params.id;
    const entity = request.body.entity;

    if (entity) {
        dispatcher.getEntityByIdAsync(id).then(oldEntity => {
            entity._id = oldEntity._id;
            entity.createdDate = oldEntity.createdDate;
            return Object.assign({}, oldEntity, entity);
        }).then(newEntity => {
            return dispatcher.updateEntityAsync(newEntity);
        }).then(updatedEntity => {
            response.status(200).send(updatedEntity);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        response.status(400).send({ message: "The following field(s) are required in the body of the request: entity." });
    }
});

entityRouter.delete("/:id", (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
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
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const id = request.params.id;

    api.getComponentsByEntityIdAsync(id).then(components => {
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

    api.getComponentByIdAsync(componentId, entityId).then(component => {
        if (getFile === "true") {
            const fileId = component.fileId ? component.fileId : null;

            if (fileId) {
                fileSystem.getFileReadStreamByIdAsync(fileId).then(fileStream => {
                    response.set("Content-Type", component.contentType);
                    response.set("Content-Length", component.contentLength);
                    fileStream.pipe(response);
                });
            } else {
                throw new Error("The component provided does not have a fileId on it.");
            }
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
    const id = request.params.id;

    const jsonRequestHandler = () => {
        const component = request.body.component;

        if (component) {
            dispatcher.getEntityByIdAsync(id).then(entity => {
                entity.components.push(component);
                return dispatcher.updateEntityAsync(entity);
            }).then(updatedEntity => {
                response.status(200).send(updatedEntity);
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        } else {
            response.status(400).send({ message: "The following field(s) are required in the body of the request: component." })
        }
    };

    const multiPartRequestHandler = () => {
        const busboy = new Busboy({ headers: request.headers });
        const fileSystem = response.locals.fileSystem;
        const newFileId = response.locals.fileSystem.ObjectID();

        const addFileAsync = file => {
            file.pause();

            return new Promise((resolve, reject) => {
                return fileSystem.getFileWriteStreamByIdAsync(newFileId).then(writeStream => {
                    let dataLength = 0;

                    file.on("data", data => {
                        dataLength += data.length;
                    });

                    file.on("end", () => {
                        resolve(dataLength);
                    });

                    file.on("error", error => {
                        reject(error);
                    });

                    file.pipe(writeStream);
                    file.resume();
                }).catch(error => {
                    reject(error)
                });
            });
        };

        busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
            let contentLength = 0;

            addFileAsync(file).then((dataLength: any) => {
                contentLength = dataLength;
                return dispatcher.getEntityByIdAsync(id);
            }).then((entity: any) => {
                const component = {
                    fileId: newFileId,
                    fileName,
                    contentType: mimeType,
                    contentLength,
                    type: "file"
                };

                entity.components.push(component);
                return dispatcher.updateEntityAsync(entity);
            }).then(updatedEntity => {
                response.status(200).send(updatedEntity);
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
        jsonRequestHandler();
    } else {
        multiPartRequestHandler();
    }
});

entityRouter.patch("/:entityId/components/:componentId", jsonParser, (request, response) => {
    const api = response.locals.dispatcherApi;
    const dispatcher = <ClarityTransactionDispatcher>api.clarityTransactionDispatcher;
    const entityId = request.params.entityId;
    const componentId = request.params.componentId;

    const jsonRequestHandler = () => {
        const component = request.body.component;
        let updatedComponent = {};

        if (component) {
            api.getComponentByIdAsync(componentId, entityId).then(oldComponent => {
                if (oldComponent.type !== "file") {
                    component._id = oldComponent._id;
                    updatedComponent = Object.assign({}, oldComponent, component);

                    return Promise.resolve();
                } else {
                    throw new Error("Component is of type file. Use multipart/form-data to modifiy the component.");
                }
            }).then(() => {
                return dispatcher.getEntityByIdAsync(entityId);
            }).then(entity => {
                const componentIndex = entity.components.findIndex(component => component._id == componentId);
                entity.components[componentIndex] = updatedComponent;

                return dispatcher.updateEntityAsync(entity);
            }).then(updatedEntity => {
                response.status(200).send(updatedEntity);
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        } else {
            response.status(400).send({ message: "The following field(s) are required in the body of the request: component." })
        }
    };

    if (request.headers["content-type"] === "application/json") {
        jsonRequestHandler();
    } else {
        // multiPartRequestHandler();
    }
});

export default entityRouter;