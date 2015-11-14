exports.Browser = {
    environment: "browser",
    libs: [
        "node_modules/lodash/index.js",
        "node_modules/bane/lib/bane.js"
    ],
    sources: ["lib/evented-logger.js"],
    tests: ["test/evented-logger-test.js"]
};

exports.Node = {
    extends: "Browser",
    environment: "node"
};
