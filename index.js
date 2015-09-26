"use strict";

let fs = require("fs");
let exec = require("child_process").exec
let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let scriptDir = __dirname + "/scripts/";

let config = require("/etc/gitstore.json");

app.use(bodyParser.json());

app.get("/", (req, res) => {
    fs.readdir(config.repoDir, (error, items) => {
        if (error) {
            console.error("Could not list repositories, error: " + error);
            return res.status(500).send("Could not list repositories, error: " + error);
        }

        res.type("text").send(items.map(item => "ssh://" + config.hostname + config.repoDir + "/" + item).join("\n"));
    });
});

app.post("/github", (req, res) => {
    if (req.headers["x-github-event"] !== "push") {
        console.error("Got unknown GitHub request");
        res.status(400).end();
        return;
    }

    fs.exists(config.repoDir + "/" + req.body.repository.name, exists => {
        if (!exists) {
            console.error("Got GitHub push for repository we do not recognize, " + req.body.repository.name);
            res.status(404).end();
            return;
        }

        console.log("Repository " + req.body.repository.name + " updated at GitHub!");
        let cmd = scriptDir + "update.sh " + config.repoDir + "/" + req.body.repository.name + " " + req.body.repository.ssh_url;

        console.log("Executing " + cmd);
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Failed to execute command, error: " + error);
                return res.status(500).end();
            }

            console.log(stdout);
            console.log(stderr);
            res.end();
        });
    });
});

app.get("/update/:name", (req, res) => {
    console.log("Repository " + req.params.name + " updated!");
    res.end();
});

app.get("/create/:name", (req, res) => {
    let cmd = scriptDir + "create.sh " + scriptDir + " " + config.repoDir + " " + req.params.name + " http://" + config.hostname;
    let repo = "ssh://" + config.hostname + config.repoDir + "/" + req.params.name;

    console.log("Executing " + cmd);
    exec(cmd, (error, stdout, stderr) => {
         if (error) {
            console.error("Failed to execute command, error: " + error);
            return res.status(500).end();
        }

        console.log(stdout);
        console.log(stderr);
        console.log("Repository " + req.params.name + " created!");
        res.send(repo);
    });
});

let server = app.listen(config.port, () => {
    console.log("GitStore listening at http://" + config.hostname + ":" + config.port);
});

// wget -O - -q http://localhost:3000/create/test3 | xargs git clone
