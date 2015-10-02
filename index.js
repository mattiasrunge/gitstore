"use strict";

let koa = require("koa");
let bodyParser = require("koa-bodyparser");
let route = require("koa-route");
let staticFile = require("koa-static");
let StatusError = require("./lib/status-error");
let git = require("./lib/git");

let config = require("/etc/gitstore.json");

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

app.use(staticFile("./client"));

app.use(route.get("/", function*() {
    let items = yield git.list(config.hostname, config.repoDir);
    this.type = "text/plain";
    this.body = items.join("\n");
}));

app.use(route.get("/list", function*() {
    let items = yield git.list(config.hostname, config.repoDir);
    this.type = "text/plain";
    this.body = items.join("\n");
}));

app.use(route.post("/github", function*() {
    if (this.request.headers["x-github-event"] !== "push" & this.request.headers["x-github-event"] !== "ping") {
        throw new StatusError("Got unknown GitHub request: " + this.request.headers["x-github-event"], 400);
    }

    yield git.updateFromGitHub(config.hostname, config.repoDir, this.request.body.repository.name, this.request.body.repository.ssh_url);
    this.type = "text/plain";
    this.body = "OK";
}));

app.use(route.get("/update/:name", function*(name) {
    console.log("Repository " + name + " updated!");
    this.type = "text/plain";
    this.body = "OK";
}));

app.use(route.get("/create/:name", function*(name) {
    let repo = yield git.create(config.hostname, config.repoDir, name);
    this.type = "text/plain";
    this.body = repo;
}));

app.listen(config.port);

console.log("GitStore listening at http://" + config.hostname + ":" + config.port);

// wget -O - -q http://localhost:3000/create/test3 | xargs git clone
