var fs = require("fs");
var path = require("path");

const testDirectory = path.resolve(__dirname, "./../lib/tests");

fs.readdir(testDirectory, function (err, files) {
    if (err == null) {

        files.forEach((file) => {
            if (path.extname(file) === ".js") {
                var tests = require(path.resolve(testDirectory, file));
                var defaultModules = tests.default || tests;

                Object.keys(defaultModules).reduce(function (promise, testName) {
                    if (typeof defaultModules[testName] !== "function") {
                        return Promise.resolve("UNEXPECTED EXPORT:  This export '" + testName + "' needs to be a function.");
                    }
                    return promise.then(() => {
                        try {
                            let result = defaultModules[testName]();
                            result = result instanceof Promise ? result : Promise.resolve(result);

                            return result.then(() => {
                                console.log("PASSED: " + testName);
                            }).catch((error) => {
                                console.log("FAILED: " + testName);
                                console.log(error);
                            });
                        } catch (error) {
                            console.log("FAILED: " + testName);
                            console.log(error);

                            return Promise.reject(error);
                        }
                    });
                }, Promise.resolve()).catch((error) => {
                    console.log("UNEXPECTED FAILURE: Most likely an async error.");
                });
            }
        });
    }
});