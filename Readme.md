# evented-logger

[![Build status](https://secure.travis-ci.org/busterjs/evented-logger.png?branch=master)](http://travis-ci.org/busterjs/evented-logger)

> Event emitting logger with custom log events

`evented-logger` is an event emitting logger utility. It does not print
anything to the stdout or anywhere else, it only emits events. You can create
logger objects with arbitrary levels, set the current level and subscribe to
events to print them somewhere visible. Logged messages are formatted by a
pluggable formatter (e.g. something like [formatio](http://search.npmjs.org/#/formatio)).

`evented-logger` works in browsers (including old and rowdy ones, like IE6)
and Node. It will define itself as an AMD module if you want it to (i.e. if
there's a `define` function available).


## Developers - Running tests

```
npm install
./node_modules/.bin/buster-test --node
./node_modules/.bin/buster-server
./node_modules/.bin/buster-test --browser
```

## Events

### Event: `"log", function (envelope) {}`

Emitted every time data is logged and is allowed by the current log level. Any
messages logged to the current level or a higher priority level will be emitted.


## Methods

Parts of the logger API is dynamically assembled by the `create` method. The
API documentation also describes the methods dynamically generated by this
method in the default setup.

### `eventedLogger.create([options])`

Creates a new logger. The default behavior is to create a logger with the
levels/methods `error`, `warn`, `log` and `debug`. `"debug"` is
the default log level, meaning that all messages are emitted.

The `options` argument can be used to control what logging methods the
logger should have, default logging level and formatting method.


**Typical usage**

```javascript
var logger = eventedLogger.create();

logger.on("log", function (msg) {
    console.log("[" + msg.level.toUpperCase() + "] " + msg.message);
});

logger.warn("Watch it!");
logger.log([], 42, {});

// Prints the following to stdout:
// [WARN] Watch it!
// [LOG] [] 42 {}
```


**Setting the default level**

```javascript
var logger = eventedLogger.create({ level: "warn" });

logger.on("log", function (msg) {
    console.log("[" + msg.level.toUpperCase() + "] " + msg.message);
});

logger.warn("Watch it!");
logger.log([], 42, {});

// Will not print the log message, so stdout looks like:
// [WARN] Watch it!
```


**Creating custom loggers**

Custom levels should be passed ordered from highest to lowest severity. The
generated methods will pass through messages if the current log level is set
to either the same level as the message or one in the lower indexes of the
levels array.

When you create a logger with customized levels, the default log level will
be set to the most permissive one, i.e. the last level in the array.

```javascript
var logger = eventedLogger.create({
    levels: ["nuclear", "eerie", "info", "debug"]
});

logger.level == "debug"; //=&gt; true
typeof logger.error == "undefined";

logger.nuclear("This is NOT good");
```

If you want the logger to have some other default log level than the most
permissive one, include `level`:

```javascript
var logger = eventedLogger.create({
    levels: ["nuclear", "eerie", "info", "debug"],
    level: "eerie"
});

logger.info("This is NOT good"); // Won't be emitted
```


### `eventedLogger.format(object)`

Formats a logged object. This function is called once for each argument
passed to a logger method. The default implementation serializes objects
through `JSON.stringify <https://developer.mozilla.org/en/json>`_. Functions
and primitives are converted to strings by way of their `toString`
methods.

The method can be overridden to provide more powerful formatting of objects
such as functions and problematic host objects.

`buster-test <http://busterjs.org/docs/test/>`_ provides more readable
formatting through the `formatio <http://busterjs.org/docs/format>`_ module.
There is basically three ways to achieve this:


**Override the original method**

```javascript
eventedLogger.format = buster.format.ascii;
```


**Override the method on an instance**

```javascript
var logger = eventedLogger.create();
logger.format = buster.format.ascii;
```


**Pass the formatter to `create`**

```javascript
var logger = eventedLogger.create({
    logger: buster.format.ascii
});
```


### `eventedLogger.error(message1[, message2, ...])`

Logs messages with the `"error"` level. Messages will always be emitted
from the logger unless the log level has been set to a non-existent level.

```javascript
var logger = eventedLogger.create();
// ...

logger.error("Something went wrong", myObjToDebug);
```

> If you have created a logger with custom levels, the `error` method
will not exist unless you explicitly included it.


### `eventedLogger.warn(message1[, message2, ...])`

Logs messages with the `"warn"` level. This message will be emitted from
the logger unless its level is set to `"error"` or a non-existent level.

```javascript
var logger = eventedLogger.create();
// ...

logger.warn("Something fishy?", myObjToDebug);
```

> If you have created a logger with custom levels, the `warn` method
will not exist unless you explicitly included it.


### `eventedLogger.log(message1[, message2, ...])`

Logs messages with the `"log"` level. This message will be emitted from
the logger if its level is set to `"log"` or `"debug"` (default).

```javascript
var logger = eventedLogger.create();
// ...

logger.log("Here's an object", myObjToDebug);
```

> If you have created a logger with custom levels, the `log` method
will not exist unless you explicitly included it.


### `eventedLogger.debug(message1[, message2, ...])`

Logs messages with the `"debug"` level. This message will only be emitted
from the logger if its level is set to `"debug"` (default).

```javascript
var logger = eventedLogger.create();
// ...

logger.debug("What's going on??", myObjToDebug);
```

> If you have created a logger with custom levels, the `debug`
method will not exist unless you explicitly included it.


## Properties

## `eventedLogger.level`

Default: `"debug"`

Set the level of the logger, silence all messages for less severe levels.
The default level is the most permissive one - `"debug"` when not using
custom levels.


## Supporting objects

### `eventedLoggerEnvelope`

An object representing a logged message. Contains two properties:

    `level`:
        The log level as a lower case string, e.g. `"debug"`

    `message`:
        A formatted log message, containing all arguments passed to the log
        method joined by a single blank space.


### `eventedLoggerOptions`

Options passed to [`eventedLogger.create`](#eventedLogger.create([options])).

    `level`:
        The default log level, i.e. the minimum required level the logger will
        emit events for. Default value is `"debug"`, i.e. all messages.

    `levels`:
        An array of levels the logger supports. Default is `["error", "warn",
        "log", "debug"]`. Each string in this array names methods created on
        the logger.

    `formatter`:
        The function that should format arguments.
        See [`eventedLogger.format`](#eventedLogger.format(object)).
