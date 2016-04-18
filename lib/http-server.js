"use strict";

const fs = require("fs-extra-promise");
const http = require("http");
const co = require("bluebird").coroutine;
const socketio = require("socket.io");
const koa = require("koa.io");
const bodyParser = require("koa-bodyparser");
const route = require("koa-route");
const staticFile = require("koa-static");
const HttpError = require("./http-error");
const CleanCSS = require("clean-css");

let Server = function(options) {
    let css;
    let cssTime;
    let app = koa();

    // Setup application
    app.name = options.name;
    app.use(bodyParser());

    // Configure error handling
    app.use(function*(next) {
        try {
            yield next;
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            this.response.status = error.status || 500;
            this.type = "text/plain";
            this.body = error.message || error;
        }
    });

    // Serve static assets
    if (options.client) {
        app.use(route.get("/style.css", function*() {
            let stat = yield fs.statAsync(options.client + "/style.css");

            if (stat.mtime.toString() !== cssTime) {
                cssTime = stat.mtime.toString();

                let source1 = yield fs.readFileAsync(__dirname + "/../client/style.css");
                let css1 = new CleanCSS({ root: __dirname + "/../client" }).minify(source1).styles;

                let source2 = yield fs.readFileAsync(options.client + "/style.css");
                let css2 = new CleanCSS({ root: options.client }).minify(source2).styles;

                css = css1 + " " + css2;
            }

            this.type = "text/css";
            this.body = css;
        }));

        app.use(route.get("/mfw.js", function*() {
            let source = (yield fs.readFileAsync(__dirname + "/../client/mfw.js")).toString();
            let libs = require(options.client + "/libs.json");
            let components = [];
            let items = yield fs.readdirAsync(options.client + "/components");
            for (let item of items) {
                let stat = yield fs.statAsync(options.client + "/components/" + item);
                if (stat.isDirectory()) {
                    components.push(item);
                }
            }

            source = source.replace(/\/\*\* PATHS \*\*\//g, Object.keys(libs).map(name => name + ": \"" + libs[name] + "\"").join(",\n        "));
            //source = source.replace(/\/\*\* SHIM \*\*\//g, components.join(", ")); // TODO
            source = source.replace(/\/\*\* COMPONENTS \*\*\//g, components.map(name => "\"" + name + "\"").join(", "));

            this.type = "application/javascript";
            this.body = source;
        }));

        app.use(staticFile(options.client));
        app.use(staticFile(__dirname + "/../client"));
    }

    // Create routes if we have any
    if (options.routes) {
        for (let name of Object.keys(options.routes)) {
            let method = "get";
            let routeName = name;

            if (name[0] !== "/") {
                let parts = name.match(/(.+?)(\/.*)/);
                method = parts[1];
                routeName = parts[2];
            }

            app.use(route[method](routeName, options.routes[name]));
        }
    }

    // This must come after last app.use()
    let server = http.Server(app.callback());


    // Socket.io if we have defined API
    if (options.api) {
        let io = socketio(server);

        io.on("connection", function(socket) {
            for (let name of Object.keys(options.api)) {
                socket.on(name, function(data, ack) {
                    co(options.api[name])(data)
                    .then(function(result) {
                        ack(null, result);
                    })
                    .catch(function(error) {
                        ack(error.stack);
                    });
                });
            }
        });

        options.api.emit = function(event, data) {
            io.emit(event, data);
        };
    }

    this.start = function() {
        server.listen(options.port, options.bindTo);
        return this;
    };
};

module.exports = function(options) {
    return new Server(options);
};
