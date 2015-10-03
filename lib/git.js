"use strict";

let fs = require("fs-promise");
let exec = require("child-process-promise").exec;
let co = require("bluebird").coroutine;
let StatusError = require("./status-error");
let scriptDir = __dirname + "/../scripts/";

module.exports.uri = function(hostname, dir, name) {
    return "ssh://" + hostname + dir + "/" + name;
};

module.exports.list = co(function*(hostname, dir) {
    let items = yield fs.readdir(dir);
    return items.map(module.exports.uri.bind(null, hostname, dir));
});

module.exports.create = co(function*(hostname, dir, name) {
    if (yield fs.exists(dir + "/" + name)) {
        throw new StatusError("Repository already exists, " + name, 409);
    }

    let cmd = scriptDir + "create.sh " + scriptDir + " " + dir + " " + name + " http://" + hostname;

    console.log("Executing " + cmd);
    let result = yield exec(cmd);

    console.log(result.stdout);
    console.log(result.stderr);
    console.log("Repository " + name + " created!");

    return module.exports.uri(hostname, dir, name);
});

module.exports.updateFromGitHub = co(function*(hostname, dir, name, url) {
    console.log("Repository " + name + " updated at GitHub!");

    let exists = yield fs.exists(dir + "/" + name);

    if (!exists) {
        throw new StatusError("Got GitHub push for repository we do not recognize, " + name, 404);
    }

    let cmd = scriptDir + "update.sh " + dir + "/" + name + " " + url;

    console.log("Executing " + cmd);
    let result = yield exec(cmd);

    console.log(result.stdout);
    console.log(result.stderr);
    console.log("Repository " + this.request.body.repository.name + " updated!");

    return module.exports.uri(hostname, dir, name);
});
