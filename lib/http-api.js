"use strict";

const git = require("./git");

module.exports = {
    "list": function*(data) {
        return yield git.list();
    },
    "info": function*(name) {
        return yield git.info(name);
    },
    "history": function*(name) {
        return yield git.history(name);
    }
};
