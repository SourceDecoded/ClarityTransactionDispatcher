var path = require("path");

var distribution = {
    entry: [
        "./library/main.js"
    ],
    output: {
        filename: 'main.js',
        library: "clarityDispatcher",
        libraryTarget: "umd",
        path: './dist'
    }
};

module.exports = [
    distribution
]