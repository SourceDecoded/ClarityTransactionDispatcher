"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Uptimes = require("./routes/Uptimes");

var _Uptimes2 = _interopRequireDefault(_Uptimes);

var _Transactions = require("./routes/Transactions");

var _Transactions2 = _interopRequireDefault(_Transactions);

var _Logs = require("./routes/Logs");

var _Logs2 = _interopRequireDefault(_Logs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Router = function () {
    function Router(app, dispatcherMonitor) {
        _classCallCheck(this, Router);

        this.app = app;
        this.dispatcherMonitor = dispatcherMonitor;
    }

    _createClass(Router, [{
        key: "init",
        value: function init() {
            var _this = this;

            this.app.use(function (request, response, next) {
                response.header("Access-Control-Allow-Origin", "*");
                response.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
                response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
                response.locals.dispatcherMonitor = _this.dispatcherMonitor;
                next();
            });

            this.app.use("/api/uptimes", _Uptimes2.default);
            this.app.use("/api/transactions", _Transactions2.default);
            this.app.use("/api/logs", _Logs2.default);

            this.app.use(function (error, request, response, next) {
                if (error) {
                    response.status(400).send({ message: error.message });
                } else {
                    next();
                }
            });
        }
    }]);

    return Router;
}();

exports.default = Router;
//# sourceMappingURL=Router.js.map