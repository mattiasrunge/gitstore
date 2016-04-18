"use strict";

const server = require("./lib/http-server");
const git = require("./lib/git");
const config = require("/etc/gitstore.json");

git.init(config.hostname, config.repoDir)
.then(function() {
    server({
        name: "GitStore",
        port: config.port,
        bindTo: config.bindTo,
        api: require("./lib/http-api"),
        routes: require("./lib/http-routes"),
        client: __dirname + "/client"
    }).start();

    console.log("GitStore listening at " + config.bindTo + ":" + config.port);
});
