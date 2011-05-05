var buster = buster || {};

if (typeof require != "undefined") {
    buster = require("buster-core");
}

(function () {
    function indexOf(array, item) {
        if (array.indexOf) {
            return array.indexOf(item);
        }

        for (var i = 0, l = array.length; i < l; ++i) {
            if (array[i] == item) {
                return i;
            }
        }

        return -1;
    }

    function createLogger(name, level) {
        return function () {
            if (level > indexOf(this.levels, this.level)) {
                return;
            }

            var message = [];

            for (var i = 0, l = arguments.length; i < l; ++i) {
                message.push(this.format(arguments[i]));
            }

            this.emit("log", {
                message: message.join(" "),
                level: this.levels[level]
            });
        };
    }

    buster.eventedLogger = buster.extend(buster.create(buster.eventEmitter), {
        create: function (opt) {
            opt = opt || {};
            var logger = buster.create(this);
            logger.levels = opt.levels || ["error", "warn", "log", "debug"];
            logger.level = opt.level || logger.levels[logger.levels.length - 1];

            for (var i = 0, l = logger.levels.length; i < l; ++i) {
                logger[logger.levels[i]] = createLogger(logger.levels[i], i);
            }

            if (opt.formatter) {
                logger.format = opt.formatter;
            }

            return logger;
        },

        format: function (obj) {
            if (typeof obj != "object") {
                return "" + obj;
            }

            try {
                return JSON.stringify(obj);
            } catch (e) {
                return "" + obj;
            }
        }
    });
}());

if (typeof module != "undefined") {
    module.exports = buster.eventedLogger;
}
