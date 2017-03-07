import * as express from "express";
import * as Busboy from "busboy";

const componentRouter = express.Router();

// Body: entity, component
componentRouter.post("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let componentForm = <any>{};

    const addComponent = () => {
        const entity = JSON.parse(componentForm.entity);
        const component = JSON.parse(componentForm.component);

        dispatcher.addComponentAsync(entity, component).then(() => {
            response.status(200).json({
                message: "Component Added Successfully!"
            });
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
        });
    };

    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        componentForm[fieldName] = value;
    });

    busboy.on("finish", () => {
        addComponent();
    });

    request.pipe(busboy);
});

// Parameters: id
componentRouter.get("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const componentId = request.query.id;
    const count = request.query.count;

    if (componentId) {
        dispatcher.getComponentByIdAsync(componentId).then((component) => {
            response.status(200).json({
                message: "Component Found!",
                component: component
            });
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
        });
    } else if (count == "true") {
        dispatcher._getDatabaseAsync().then((db: any) => {
            db.collection("components", (err, collection) => {
                if (err != null) {
                    response.status(400).json({
                        message: "ERROR!",
                        error: err
                    });;
                } else {
                    collection.count(function (error, total) {
                        if (error != null) {
                            response.status(400).json({
                                message: "ERROR!",
                                error: error
                            });;
                        } else {
                            response.status(200).json({
                                message: "Found total number of components!",
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
        // TODO: If enityId passed in then search and return components belonging to entity.
        response.status(400).json({
            message: "Please provide the id to look up the component with."
        });
    }
});

// Body: entity, component
componentRouter.patch("/", (request, response) => {
    const busboy = new Busboy({ headers: request.headers });
    const dispatcher = response.locals.clarityTransactionDispatcher;
    let componentForm = <any>{};

    const updateComponent = () => {
        const entity = JSON.parse(componentForm.entity);
        const component = JSON.parse(componentForm.component);

        dispatcher.updateComponentAsync(entity, component).then(() => {
            response.status(200).json({
                message: "Component Updated Successfully!"
            });
        }).catch((error) => {
            response.status(400).json({
                message: "ERROR!",
                error: error
            });;
        });
    };

    busboy.on("field", (fieldName, value, fieldNameTruncated, valueTruncated, encoding, mimeType) => {
        componentForm[fieldName] = value;
    });

    busboy.on("finish", () => {
        updateComponent();
    });

    request.pipe(busboy);
});

// Parameters: id
componentRouter.delete("/", (request, response) => {
    const dispatcher = response.locals.clarityTransactionDispatcher;
    const componentId = request.query.id;

    if (!componentId) {
        response.status(400).json({
            message: "Please provide the id of the component to be deleted."
        });
    } else {
        dispatcher.getComponentByIdAsync(componentId).then((component) => {
            return dispatcher.removeComponentAsync(component).then(() => {
                response.status(200).json({
                    message: "Component Deleted Successfully!"
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

export default componentRouter;