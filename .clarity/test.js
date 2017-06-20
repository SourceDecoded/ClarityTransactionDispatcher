var fs = require("fs-extra");
var path = require("path");

const testDirectory = path.join(__dirname, "../lib/tests");
const specialTestNames = {
    "prepare": true,
    "destroy": true,
    "clean": true
};

const promiseFunction = () => {
    return Promise.resolve(null);
}

const promisify = (fn) => {
    return () => {
        fn = fn || promiseFunction;
        var result = fn();

        result = result instanceof Promise ? result : Promise.resolve(result);

        return result;
    }
}

fs.readdir(testDirectory).then((files) => {
    files.forEach((file) => {
        if (path.extname(file) === ".js") {

            var tests = require(path.join(testDirectory, file));
            var defaultModules = tests.default || tests;

            var prepare = promisify(defaultModules.prepare);
            var destroy = promisify(defaultModules.destroy);
            var clean = promisify(defaultModules.clean);

            Object.keys(defaultModules).filter((testName) => {
                return specialTestNames[testName] == null;
            }).reduce((promise, testName) => {
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

                        return Promise.resolve(null);
                    }
                }).then(() => {
                    return clean();
                });
            }, prepare()).catch((error) => {
                console.log("UNEXPECTED FAILURE: Most likely an async error.");
            }).then(() => {
                return destroy();
            });
        }
    });
}).catch(() => {
    console.log(`Couldn't find test folder here: ${testDirectory}`);
});