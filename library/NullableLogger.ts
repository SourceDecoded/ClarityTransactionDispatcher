export default class NullableLogger {
    warn(message: string, ...data: any[]) { }
    error(message: string, ...data: any[]) { }
    message(message: string, ...data: any[]) { }
    info(message: string, ...data: any[]) { }
    debug(message: string, ...data: any[]) { }
}