import * as express from "express";
import * as Busboy from "busboy";

const entityRouter = express.Router();

entityRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entityForm = <any>{};

    const addEntity = () => {
        let components = [];

        if (entityForm.components) {
            try {
                components = JSON.parse(entityForm.components);
            } catch (error) {
                return response.status(400).send({ message: error.message });
            }
        }

        const id = entityForm.id || null;
        let content = entityForm.content || null;

        dispatcher.addEntityAsync(content, components, id).then(result => {
            response.status(200).send({ data: result });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    };

    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        entityForm[fieldName] = value;
    });

    busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
        if (entityForm.components) {
            entityForm[fieldName] = file;
            addEntity();
        } else {
            response.status(400).send({ message: "Components field needs to be sent before file stream in form data." });
        }
    });

    busboy.on("finish", () => {
        if (!entityForm.content) {
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
            response.status(200).send({ data: { entity } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else if (getCount == "true") {
        dispatcher.getEntityCountAsync().then(count => {
            response.status(200).send({ data: { count } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        const config = {
            lastId,
            lastUpdatedDate,
            lastCreatedDate,
            pageSize
        };

        dispatcher.getEntitiesAsync(config).then(entities => {
            response.status(200).send({ data: { entities } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    }
});

entityRouter.patch("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entityForm = <any>{};

    const updateEntity = () => {
        if (entityForm.entity) {
            let entity;

            try {
                entity = JSON.parse(entityForm.entity)
            } catch (error) {
                return response.status(400).send({ message: error.message });
            }

            dispatcher.updateEntityAsync(entity).then(entity => {
                response.status(200).send({ data: { entity } });
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        } else {
            response.status(400).send({ message: "An entity was not provided in the body." })
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
                response.status(200).send({ data: { entity } });
            });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        response.status(400).send({ message: "The id of the entity to be deleted was not provided as a parameter." });
    }
});

export default entityRouter;