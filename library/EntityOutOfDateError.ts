import {IEntity} from "./interfaces"

export default class EntityOUtOfDateError extends Error {
    currentRevision: IEntity;
}