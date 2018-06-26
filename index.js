"use strict";

const server = require("./lib/http-server");
const git = require("./lib/git");

git.init(process.env.FQDN, process.env.REPODIR || "/repos")
.then(function() {
    server({
        name: "GitStore",
        port: process.env.PORT || 6000,
        api: require("./lib/http-api"),
        routes: require("./lib/http-routes"),
        client: __dirname + "/client"
    }).start();

    console.log("GitStore listening at port " + process.env.PORT || 6000);
});
