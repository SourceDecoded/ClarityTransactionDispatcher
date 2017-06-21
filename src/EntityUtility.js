export default class EntityUtility {
    constructor(entity) {
        this.entity = entity || null;
    }

    _assertHasEntity() {
        if (this.entity == null) {
            throw new Error("The utility needs to have an entity to act on.");
        }
    }

    getComponent(type) {
        this._assertHasEntity();

        return this.getComponents(type)[0] || null;
    }

    getComponents(type) {
        this._assertHasEntity();

        return this.entity.components.filter((component) => {
            return component.type === type;
        });
    }

    hasComponent(type) {
        this._assertHasEntity();

        return this.getComponent(type) != null ? true : false;
    }

    hasTypeComposition(types) {
        this._assertHasEntity();

        return types.every((type) => {
            return this.hasComponent(type);
        });
    }
}