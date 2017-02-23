"use strict";
var ObjectIDMock = function (id) {
    var timestamp = Date.now();
    return {
        equals: function (id) {
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
ObjectIDMock.createFromHexString = function (hexString) {
    return ObjectIDMock(hexString);
};
ObjectIDMock.createFromTime = function (time) {
    return ObjectIDMock(time.toString(16));
};
ObjectIDMock.isValid = function () {
    return true;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObjectIDMock;
//# sourceMappingURL=ObjectID.js.map