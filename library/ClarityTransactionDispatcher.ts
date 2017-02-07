import { ISystem } from "./interfaces";

export default class ClarityTransactionDispatcher {
    constructor() {

    }

    addEntityAsync(entity: any) { }
    addServiceAsync(name: string, service: any) { }
    addSystemAsync(system: ISystem) { }
    getEntityByIdAsync() { }
    getEntityContentStream() { }
    getEntitiesAsync() { }
    getService(name: string) { }
    pause() { }
    removeEntityAsync(entity: any) { }
    removeServiceAsync(name: string) { }
    removeSystemAsync(system: ISystem) { }
    start() { }
    updateEntityAsync(entity: any) { }

}