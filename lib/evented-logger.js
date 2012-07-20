((typeof define === "function" && define.amd && function (m) {
    define(["lodash", "bane"], m);
}) || (typeof module === "object" &&
       typeof require === "function" && function (m) {
        module.exports = m(require("lodash"), require("bane"));
    }) || function (m) { this.eventedLogger = m(this._, this.bane); }
)(function (_, bane) {
    "use strict";

    function formatMessage(message) {
        if (!this.logFunctions && typeof message === "function") {
            return this.format(message());
        }
        return this.format(message);
    }

    function createLogger(name, level) {
        return function () {
            if (level > _.indexOf(this.levels, this.level)) { return; }
            var self = this;
            var message = _.reduce(arguments, function (memo, arg) {
                return memo.concat(formatMessage.call(self, arg));
            }, []).join(" ");
            this.emit("log", { message: message, level: this.levels[level] });
        };
    }

    function F() {}
    function create(obj) {
        F.prototype = obj;
        return new F();
    }

    return bane.createEventEmitter({
        create: function (opt) {
            opt = opt || {};
            var logger = create(this);
            logger.levels = opt.levels || ["error", "warn", "log", "debug"];
            logger.level = opt.level || logger.levels[logger.levels.length - 1];

            _.each(logger.levels, function (level, i) {
                logger[level] = createLogger(level, i);
            });

            if (opt.formatter) { logger.format = opt.formatter; }
            logger.logFunctions = !!opt.logFunctions;
            return logger;
        },

        format: function (obj) {
            if (typeof obj !== "object") { return String(obj); }

            try {
                return JSON.stringify(obj);
            } catch (e) {
                return String(obj);
            }
        }
    });
});