"use strict";

const git = require("./git");

module.exports = {
    "/list": function*() {
        let items = yield git.list();

        if (this.request.headers.accept.indexOf("application/json") !== -1) {
            this.type = "application/json";
            this.body = JSON.stringify(items, null, 2);
        } else {
            this.type = "text/plain";
            this.body = items.map(item => item.name).join("\n");
        }
    },
    "post/github": function*() {
        if (this.request.headers["x-github-event"] !== "push" & this.request.headers["x-github-event"] !== "ping") {
            throw new Error("Got unknown GitHub request: " + this.request.headers["x-github-event"], 400); // TODO: Change to real error when MFW exposes the class
        }

        yield git.updateFromGitHub(this.request.body.repository.name, this.request.body.repository.ssh_url);
        this.type = "text/plain";
        this.body = "OK";
    },
    "/update/:name": function*(name) {
        yield git.updated(name);
        console.log("Repository " + name + " updated!");
        this.type = "text/plain";
        this.body = "OK";
    },
    "/create/:name": function*(name) {
        let repo = yield git.create(name);
        this.type = "text/plain";
        this.body = repo;
    }
};
