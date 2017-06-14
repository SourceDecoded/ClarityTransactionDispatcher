"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _index = require("./../index.js");

var _FileSystemService = require("./../services/FileSystemService");

var _FileSystemService2 = _interopRequireDefault(_FileSystemService);

var _jwtSimple = require("jwt-simple");

var jwtSimple = _interopRequireWildcard(_jwtSimple);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var mongoDb = new _index.MongoDb({
    isInMemory: true
});
var fileSystem = new _FileSystemService2.default(mongoDb);
var dispatcher = new _index.ClarityTransactionDispatcher(mongoDb);

app.listen(3005, function () {
    return console.log("Disptacher Server is running locally on port 3005...");
});

dispatcher.startAsync().then(function () {
    return dispatcher.addServiceAsync("express", app);
}).then(function () {
    return dispatcher.addServiceAsync("fileSystem", fileSystem);
}).then(function () {
    return dispatcher.addSystemAsync(new _index.DispatcherApiSystem());
}).then(function () {
    return dispatcher.addSystemAsync(new _index.DispatcherMonitorSystem());
}).catch(function (error) {
    console.log(error);
});

setTimeout(function () {
    dispatcher.stopAsync();
}, 15000);
//# sourceMappingURL=index.js.map