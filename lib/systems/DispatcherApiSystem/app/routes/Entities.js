"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require("express");

var express = _interopRequireWildcard(_express);

var _busboy = require("busboy");

var Busboy = _interopRequireWildcard(_busboy);

var _bodyParser = require("body-parser");

var bodyParser = _interopRequireWildcard(_bodyParser);

var _ClarityTransactionDispatcher = require("./../../../../ClarityTransactionDispatcher");

var _ClarityTransactionDispatcher2 = _interopRequireDefault(_ClarityTransactionDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var entityRouter = express.Router();
var jsonParser = bodyParser.json();

entityRouter.post("/", jsonParser, function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entity = request.body;

    dispatcher.addEntityAsync(entity).then(function (createdEntity) {
        response.status(200).send(createdEntity);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.get("/", function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var lastId = request.query.lastId;
    var pageSize = request.query.pageSize;
    var lastModifiedDate = request.query.lastModifiedDate;
    var lastCreatedDate = request.query.lastCreatedDate;
    var getCount = request.query.getCount;

    if (getCount !== "true") {
        dispatcher.getEntitiesAsync({ lastId: lastId, pageSize: pageSize, lastModifiedDate: lastModifiedDate, lastCreatedDate: lastCreatedDate }).then(function (entities) {
            response.status(200).send(entities);
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    } else {
        dispatcher.getEntityCountAsync().then(function (count) {
            response.status(200).send(count.toString());
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    }
});

entityRouter.get("/:id", function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entityId = request.params.id;

    dispatcher.getEntityByIdAsync(entityId).then(function (entity) {
        response.status(200).send(entity);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.patch("/:id", jsonParser, function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entityId = request.params.id;
    var entity = request.body;

    api.updateEntityAsync(entityId, entity).then(function (updatedEntity) {
        response.status(200).send(updatedEntity);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.delete("/:id", function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entityId = request.params.id;

    api.removeEntityByIdAsync(entityId).then(function (removedEntity) {
        response.status(200).send(removedEntity);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.get("/:id/components", function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entityId = request.params.id;

    api.getComponentsByEntityIdAsync(entityId).then(function (components) {
        response.status(200).send(components);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.get("/:entityId/components/:componentId", function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var fileSystem = response.locals.fileSystem;
    var entityId = request.params.entityId;
    var componentId = request.params.componentId;
    var getFile = request.query.getFile;

    api.getComponentAsync(componentId, entityId).then(function (component) {
        if (getFile === "true") {
            return fileSystem.getFileReadStreamByIdAsync(component.fileId).then(function (fileStream) {
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
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

entityRouter.post("/:id/components", jsonParser, function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entityId = request.params.id;

    var addJsonComponent = function addJsonComponent() {
        var component = request.body;

        api.addComponentAsync(entityId, component).then(function (newComponent) {
            response.status(200).send(newComponent);
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    };

    var addFileComponent = function addFileComponent() {
        var busboy = new Busboy({ headers: request.headers });

        busboy.on("file", function (fieldName, file, fileName, encoding, mimeType) {
            api.addFileAsync(file).then(function (data) {
                var component = {
                    fileId: data.fileId,
                    fileName: fileName,
                    contentType: mimeType,
                    contentLength: data.contentLength,
                    type: "file"
                };

                return api.addComponentAsync(entityId, component);
            }).then(function (newComponent) {
                response.status(200).send(newComponent);
            }).catch(function (error) {
                response.status(400).send({ message: error.message });
            });
        });

        busboy.on("error", function (error) {
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

entityRouter.patch("/:entityId/components/:componentId", jsonParser, function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entityId = request.params.entityId;
    var componentId = request.params.componentId;

    var updateJsonComponent = function updateJsonComponent() {
        var component = request.body;

        api.updateComponentAsync(componentId, entityId, component).then(function (updatedComponent) {
            response.status(200).send(updatedComponent);
        }).catch(function (error) {
            response.status(400).send({ message: error.message });
        });
    };

    var updateFileComponent = function updateFileComponent() {
        var busboy = new Busboy({ headers: request.headers });

        busboy.on("file", function (fieldName, file, fileName, encoding, mimeType) {
            api.addFileAsync(file).then(function (data) {
                var component = {
                    fileId: data.fileId,
                    fileName: fileName,
                    contentType: mimeType,
                    contentLength: data.contentLength,
                    type: "file"
                };

                return api.updateComponentAsync(componentId, entityId, component);
            }).then(function (updatedComponent) {
                response.status(200).send(updatedComponent);
            }).catch(function (error) {
                response.status(400).send({ message: error.message });
            });
        });

        busboy.on("error", function (error) {
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

entityRouter.delete("/:entityId/components/:componentId", function (request, response) {
    var api = response.locals.dispatcherApi;
    var dispatcher = api.clarityTransactionDispatcher;
    var entityId = request.params.entityId;
    var componentId = request.params.componentId;

    api.removeComponentAsync(componentId, entityId).then(function (removedComponent) {
        response.status(200).send(removedComponent);
    }).catch(function (error) {
        response.status(400).send({ message: error.message });
    });
});

exports.default = entityRouter;
//# sourceMappingURL=Entities.js.map