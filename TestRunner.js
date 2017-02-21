var fs = require("fs");
var path = require("path");

fs.readdir("tests", function (err, files) {
    if (err == null) {

        files.forEach((file) => {
            if (path.extname(file) === ".js") {
                var tests = require(path.resolve(__dirname, "tests", file));
                var defaultModules = tests.default || tests;

                
                Object.keys(defaultModules).forEach(function (testName) {
                    try {
                        defaultModules[testName]();
                        console.log("PASSED: " + testName);
                    } catch (error) {
                        console.log("FAILED: " + testName);
                        console.log(error);
                    }
                });
            }
        });
    }
});