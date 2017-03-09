import { IObjectID, IObjectIDInstance } from "./../library/interfaces"

var ObjectIDMock: any = function (id?: string) {
    var timestamp = Date.now();

    return {
        equals: function (id: IObjectIDInstance) {
            return this.toHexString() === id.toHexString() &&
                this.getTimestamp() === id.getTimestamp();
        },
        toHexString: function () {
            return parseInt(id, 16);
        },
        getTimestamp: function () {
            return timestamp;
        }
    };
};

ObjectIDMock.createFromHexString = function (hexString: string) {
    return ObjectIDMock(hexString);
};
ObjectIDMock.createFromTime = function (time: number) {
    return ObjectIDMock(time.toString(16));
};
ObjectIDMock.isValid = function () { 
    return true;
};

export default <IObjectID>ObjectIDMock;