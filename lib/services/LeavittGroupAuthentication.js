"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var fs = _interopRequireWildcard(_fs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LeavittGroupAuthentication = function () {
    function LeavittGroupAuthentication(jwtSimple) {
        _classCallCheck(this, LeavittGroupAuthentication);

        if (jwtSimple == null) {
            throw new Error("LeavittGroupAuthentication needs to supplied a jwt.");
        }

        this.jwtSimple = jwtSimple;
        this.publicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzlDs/IW1tIkSJ9G+clkk\nm0DSb4MmwfVm9WB0CAZ9A1Iatzcm5lxayZmpYsU9XUbcOS2KzE3Dr1VWgmyEnC/K\nZpDXyRUmoTocQHXGqKahKdLvutC/umXooMW9KReYQ+6ModXYPkBRbMAhqlAOSeDF\n1IYFmiGxPYe5lziWJ+ANGk8X787eRD99D+hpVb3v4lLYtb+rULHrIoxMjgk5mLqm\nnbzu2jHEXzx7BRq5kW9VYut6DoBqwWl3PpLNdDoOTgGiBIjanYj9B7apyCy3mK3d\nc9ND/StdOfhUM+CATRDCuUrvQ937MxRVn7VdhloHpWTqLcyhkLWyNBXlZUVbn7Nr\nFwIDAQAB\n-----END PUBLIC KEY-----";
    }

    _createClass(LeavittGroupAuthentication, [{
        key: "decode",
        value: function decode(token) {
            return this.jwtSimple.decode(token, this.publicKey);
        }
    }]);

    return LeavittGroupAuthentication;
}();

exports.default = LeavittGroupAuthentication;
//# sourceMappingURL=LeavittGroupAuthentication.js.map