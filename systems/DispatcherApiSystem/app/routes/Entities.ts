import * as express from "express";
import * as Busboy from "busboy";

// TODO: Handle streaming content
const entityRouter = express.Router();

// Body: entity, components
entityRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entityForm = <any>{};

    const addEntity = () => {
        const entity = JSON.parse(entityForm.entity);
        const components = JSON.parse(entityForm.components);

        dispatcher.addEntityAsync(entity, null, components).then(() => {
            response.status(200).json({
                message: "Entity Added Successfully!"
            });
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
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

// Parameters: id, count
entityRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const entityId = request.query.id;
    const count = request.query.count;

    if (entityId) {
        dispatcher.getEntityByIdAsync(entityId).then((entity) => {
            response.status(200).json({
                message: "Entity Found!",
                entity: entity
            });
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
        });
    } else if (count == "true") {
        dispatcher._getDatabaseAsync().then((db: any) => {
            db.collection("entities", (err, collection) => {
                if (err != null) {
                    response.status(400).json({
                        message: "ERROR!",
                        error: err
                    });
                } else {
                    collection.count(function (error, total) {
                        if (error != null) {
                            response.status(400).json({
                                message: "ERROR!",
                                error: error
                            });;
                        } else {
                            response.status(200).json({
                                message: "Found total number of entities!",
                                count: total
                            });
                        }
                    });
                }
            })
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
        });
    } else {
        // TODO: Get entityIterator and return entities.
        response.status(400).json({
            message: "Please provide the id to look up the entity with."
        });
    }
});

//Body: entity
entityRouter.patch("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entityForm = <any>{};

    const updateEntity = () => {
        const entity = JSON.parse(entityForm.entity);

        dispatcher.updateEntityAsync(entity).then(() => {
            response.status(200).json({
                message: "Entity Updated Successfully!"
            });
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
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

// Parameters: id
entityRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const entityId = request.query.id;

    if (!entityId) {
        // TODO: Get entityIterator and return entities.
        response.status(400).json({
            message: "Please provide the id of the entity to be deleted."
        });
    } else {
        dispatcher.getEntityByIdAsync(entityId).then((entity) => {
            return dispatcher.removeEntityAsync(entity).then(() => {
                response.status(200).json({
                    message: "Entity Deleted Successfully!"
                });
            })
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
        });
    }
});

export default entityRouter;