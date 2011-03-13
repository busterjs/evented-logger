if (typeof require != "undefined") {
    var testCase = require("buster-util").testCase;
    var sinon = require("sinon");

    var buster = {
        assert: require("buster-assert"),
        eventedLogger: require("../lib/buster-evented-logger")
    };
}

testCase("EventedLoggerTest", {
    setUp: function () {
        this.logger = buster.eventedLogger.create();
        this.listener = sinon.spy();
    },

    "should emit log event when logging": function () {
        this.logger.on("log", this.listener);
        this.logger.log("Hey");

        buster.assert(this.listener.calledOnce);
        buster.assert(this.listener.calledWith({
            level: "log", message: "Hey"
        }));
    },

    "should emit all arguments to log": function () {
        this.logger.on("log", this.listener);
        this.logger.log("Hey", {}, [2, 3], "There");

        buster.assert(this.listener.calledOnce);
        buster.assert.equals(this.listener.args[0][0].message, "Hey {} [2,3] There");
    },

    "should emit log event when warning": function () {
        this.logger.on("log", this.listener);
        this.logger.warn("Hey");

        buster.assert(this.listener.calledOnce);
        buster.assert(this.listener.calledWith({
            level: "warn", message: "Hey"
        }));
    },

    "should emit log event when erring": function () {
        this.logger.on("log", this.listener);
        this.logger.error("Hey");

        buster.assert(this.listener.calledOnce);
        buster.assert(this.listener.calledWith({
            level: "error", message: "Hey"
        }));
    },

    "should emit log event when debugging": function () {
        this.logger.on("log", this.listener);
        this.logger.debug("Hey");

        buster.assert(this.listener.calledOnce);
        buster.assert(this.listener.calledWith({
            level: "debug", message: "Hey"
        }));
    },

    "should only emit errors when level is error": function () {
        this.logger.level = "error";
        this.logger.on("log", this.listener);
        this.logger.debug("Hey");
        this.logger.log("Hey");
        this.logger.warn("Hey");
        this.logger.error("Hey");

        buster.assert(this.listener.calledOnce);
        buster.assert.equals(this.listener.args[0][0].level, "error");
    },

    "should emit errors and warnings when level is warn": function () {
        this.logger.level = "warn";
        this.logger.on("log", this.listener);
        this.logger.debug("Hey");
        this.logger.log("Hey");
        this.logger.warn("Hey");
        this.logger.error("Hey");

        buster.assert(this.listener.calledTwice);
        buster.assert.equals(this.listener.args[0][0].level, "warn");
        buster.assert.equals(this.listener.args[1][0].level, "error");
    },

    "should emit log, errors and warnings when level is log": function () {
        this.logger.level = "log";
        this.logger.on("log", this.listener);
        this.logger.debug("Hey");
        this.logger.log("Hey");
        this.logger.warn("Hey");
        this.logger.error("Hey");

        buster.assert(this.listener.calledThrice);
        buster.assert.equals(this.listener.args[0][0].level, "log");
        buster.assert.equals(this.listener.args[1][0].level, "warn");
        buster.assert.equals(this.listener.args[2][0].level, "error");
    },

    "should emit everything when level is debug": function () {
        this.logger.level = "debug";
        this.logger.on("log", this.listener);
        this.logger.debug("Hey");
        this.logger.log("Hey");
        this.logger.warn("Hey");
        this.logger.error("Hey");

        buster.assert.equals(this.listener.callCount, 4);
    }
});
