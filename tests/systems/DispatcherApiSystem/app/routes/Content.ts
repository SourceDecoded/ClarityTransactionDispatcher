import * as express from "express";
import * as Busboy from "busboy";

const contentRouter = express.Router();

contentRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let content;

    const addContent = () => {
        dispatcher.addEntityAsync(content, [], null).then(result => {
            response.status(200).send({ data: result });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    };

    busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
        content = file;
        addContent();
    });

    busboy.on("finish", () => {
        if (!content) {
            response.status(400).send({ message: "File needs to be added to form data." });
        }
    });

    request.pipe(busboy);
});

contentRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const contentId = request.query.id;
    let entity = request.query.entity;

    if (contentId) {
        dispatcher.getEntityContentStreamByContentIdAsync(contentId).then(contentStream => {
            contentStream.on("error", error => {
                response.status(400).send({ message: error.message });
            });

            contentStream.pipe(response);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else if (entity) {
        try {
            entity = JSON.parse(entity)
        } catch (error) {
            return response.status(400).send({ message: error.message });
        }

        dispatcher.getEntityContentStreamByEntityAsync(entity).then(contentStream => {
            contentStream.on("error", error => {
                response.status(400).send({ message: error.message });
            });

            contentStream.pipe(response);
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        response.status(400).send({ message: "An id or entity is needed to retrieve a contentStream." })
    }
});

contentRouter.patch("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entity;
    let content;

    const updateContent = () => {
        if (entity) {
            try {
                entity = JSON.parse(entity)
            } catch (error) {
                return response.status(400).send({ message: error.message });
            }

            dispatcher.updateEntityContentByStreamAsync(entity, content).then(entity => {
                response.status(200).send({ data: { entity } });
            }).catch(error => {
                response.status(400).send({ message: error.message });
            });
        } else {
            response.status(400).send({ message: "An entity was not provided in the body." })
        }
    };

    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        if (fieldName === "entity") {
            entity = value;
        }
    });

    busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
        if (entity) {
            content = file;
            updateContent();
        } else {
            response.status(400).send({ message: "Entity field needs to be sent before file stream in form data." });
        }
    });

    busboy.on("finish", () => {
        if (!content) {
            response.status(400).send({ message: "File needs to be added to form data." });
        }
    });

    request.pipe(busboy);
});

contentRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let entity = request.query.entity;

    if (entity) {
        try {
            entity = JSON.parse(entity)
        } catch (error) {
            return response.status(400).send({ message: error.message });
        }

        dispatcher.removeEntityContentAsync(entity).then(entity => {
            response.status(200).send({ data: { entity } });
        }).catch(error => {
            response.status(400).send({ message: error.message });
        });
    } else {
        response.status(400).send({ message: "An entity is needed to remove a contentStream." });
    }
});

export default contentRouter;