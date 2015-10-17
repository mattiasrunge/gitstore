"use strict";

const mfw = require("mfw");
const git = require("./lib/git");
const config = require("/etc/gitstore.json");

git.init(config.hostname, config.repoDir)
.then(function() {
    mfw({
        name: "GitStore",
        port: config.port,
        api: require("./lib/http-api"),
        routes: require("./lib/http-routes"),
        client: __dirname + "/client"
    }).start();

    console.log("GitStore listening at http://" + config.hostname + ":" + config.port);
});
