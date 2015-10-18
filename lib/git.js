"use strict";

let fs = require("fs-promise");
let moment = require("moment");
let exec = require("child-process-promise").exec;
let co = require("bluebird").coroutine;
let scriptDir = __dirname + "/../scripts/";
let api = require("./http-api");

module.exports.repos = {};
module.exports.hostname = "";
module.exports.dir = "";

module.exports.init = co(function*(hostname, dir) {
    module.exports.hostname = hostname;
    module.exports.dir = dir;

    let items = yield fs.readdir(module.exports.dir);

    console.log("Found " + items.length + " repositories, loading information...");

    for (let name of items) {
        module.exports.repos[name] = yield module.exports.readRepoInformation(name);
        console.log(name + " loaded.");
    }

    console.log("Done loading repositories.");
});

module.exports.uri = function(name) {
    return "ssh://" + module.exports.hostname + module.exports.dir + "/" + name;
};

module.exports.exists = co(function*(name) {
    return yield fs.exists(module.exports.dir + "/" + name);
});

module.exports.readRepoInformation = co(function*(name) {
    if (!(yield module.exports.exists(name))) {
        throw new Error("Repository do not exist, " + name, 409); // TODO: Change to real error when MFW exposes the class
    }

    let cmd = "cd " + module.exports.dir + "/" + name + " && git rev-parse HEAD";
//     console.log("Executing " + cmd);
    let hash = (yield exec(cmd)).stdout.replace(/\n/g, "");
    let author = "";
    let subject = "";
    let timestamp = 0;

    if (hash !== "HEAD") {
        let cmd = "cd " + module.exports.dir + "/" + name + " && git show --format='%cn:%ct:%s'";
//         console.log("Executing " + cmd);
        let result = yield exec(cmd);
        let parts = result.stdout.split("\n")[0].split(":", 3);
        author = parts[0];
        timestamp = parseInt(parts[1], 10);
        subject = parts[2];
    }

    return {
        hash: hash,
        date: moment(timestamp * 1000).format("YYYY-MM-DD HH:mm:ss ZZ"),
        author: author,
        subject: subject
    };
});


module.exports.history = co(function*(name, limit, skip) {
    if (!(yield module.exports.exists(name))) {
        throw new Error("Repository do not exist, " + name, 409); // TODO: Change to real error when MFW exposes the class
    }

    let cmd = "cd " + module.exports.dir + "/" + name + " && git rev-parse HEAD";
//     console.log("Executing " + cmd);
    let hash = (yield exec(cmd)).stdout.replace(/\n/g, "");
    let history = [];

    if (hash !== "HEAD") {
        let cmd = "cd " + module.exports.dir + "/" + name + " && git log --stat --date=iso --max-count=" + limit + " --skip=" + skip;
        console.log("Executing " + cmd);
        let result = yield exec(cmd);
        history = result.stdout.split("commit ").slice(1).map(text => "Commit: " + text);
    }

    return history;
});

module.exports.info = co(function*(name) {
    return {
        name: name,
        uri: module.exports.uri(name),
        info: module.exports.repos[name]
    };
});

module.exports.updateInfo = co(function*(name) {
    module.exports.repos[name] = yield module.exports.readRepoInformation(name);
    api.emit("update", name);
});

module.exports.list = co(function*() {
    let items = Object.keys(module.exports.repos);

    return items.map(name => {
        return {
            name: name,
            uri: module.exports.uri(name),
            info: module.exports.repos[name]
        }
    });
});

module.exports.create = co(function*(name) {
    if (yield module.exports.exists(name)) {
        throw new Error("Repository already exists, " + name, 409); // TODO: Change to real error when MFW exposes the class
    }

    let cmd = scriptDir + "create.sh " + scriptDir + " " + module.exports.dir + " " + name + " http://" + module.exports.hostname;

    console.log("Executing " + cmd);
    let result = yield exec(cmd);

    console.log(result.stdout);
    console.log(result.stderr);
    console.log("Repository " + name + " created!");

    yield module.exports.updateInfo(name);

    return module.exports.uri(name);
});

module.exports.updateFromGitHub = co(function*(name, url) {
    console.log("Repository " + name + " updated at GitHub!");
    if (!(yield module.exports.exists(name))) {
        throw new Error("Got GitHub push for repository we do not recognize, " + name, 404); // TODO: Change to real error when MFW exposes the class
    }

    let cmd = scriptDir + "update.sh " + module.exports.dir + "/" + name + " " + url;

    console.log("Executing " + cmd);
    let result = yield exec(cmd);

    console.log(result.stdout);
    console.log(result.stderr);
    console.log("Repository " + name + " updated!");

    return module.exports.uri(name);
});
