"use strict";

let fs = require("fs-promise");
let exec = require("child-process-promise").exec;
let koa = require("koa");
let bodyParser = require("koa-bodyparser");
let route = require("koa-route");
let scriptDir = __dirname + "/scripts/";

let config = require("/etc/gitstore.json");

let KoaError = function(message, status) {
    this.name = "KoaError";
    this.message = message;
    this.status = status || 500;
    this.stack = (new Error()).stack;
    this.toString = () => this.name + ": (status " + this.status + ") " + this.message;
};
KoaError.prototype = new Error();
KoaError.prototype.name = "KoaError";

let app = koa();
app.name = "GitStore";
app.use(bodyParser());

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

app.use(route.get("/", function*() {
    let items = yield fs.readdir(config.repoDir);
    this.type = "text/plain";
    this.body = items.map(item => "ssh://" + config.hostname + config.repoDir + "/" + item).join("\n");
}));

app.use(route.post("/github", function*() {
    if (this.request.headers["x-github-event"] !== "push" & this.request.headers["x-github-event"] !== "ping") {
        throw new KoaError("Got unknown GitHub request: " + this.request.headers["x-github-event"], 400);
    }

    console.log("Repository " + this.request.body.repository.name + " updated at GitHub!");

    let exists = yield fs.exists(config.repoDir + "/" + this.request.body.repository.name);

    if (!exists) {
        throw new KoaError("Got GitHub push for repository we do not recognize, " + this.request.body.repository.name, 404);
    }

    let cmd = scriptDir + "update.sh " + config.repoDir + "/" + this.request.body.repository.name + " " + this.request.body.repository.ssh_url;

    console.log("Executing " + cmd);
    let result = yield exec(cmd);

    console.log(result.stdout);
    console.log(result.stderr);
    console.log("Repository " + this.request.body.repository.name + " updated!");
    this.type = "text/plain";
    this.body = "OK";
}));

app.use(route.get("/update/:name", function*(name) {
    console.log("Repository " + name + " updated!");
    this.type = "text/plain";
    this.body = "OK";
}));

app.use(route.get("/create/:name", function*(name) {
    let exists = yield fs.exists(config.repoDir + "/" + name);

    if (exists) {
        throw new KoaError("Repository already exists, " + name, 409);
    }

    let cmd = scriptDir + "create.sh " + scriptDir + " " + config.repoDir + " " + name + " http://" + config.hostname;
    let repo = "ssh://" + config.hostname + config.repoDir + "/" + name;

    console.log("Executing " + cmd);
    let result = exec(cmd);

    console.log(result.stdout);
    console.log(result.stderr);
    console.log("Repository " + name + " created!");
    this.type = "text/plain";
    this.body = repo;
}));

app.listen(config.port);

console.log("GitStore listening at http://" + config.hostname + ":" + config.port);

// wget -O - -q http://localhost:3000/create/test3 | xargs git clone
