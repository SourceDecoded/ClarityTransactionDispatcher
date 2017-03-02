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

    if (!componentId) {
        // TODO: If enityId passed in then search and return components belonging to entity.
        response.status(400).json({
            message: "Please provide the id to look up the component with."
        });
    } else {
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