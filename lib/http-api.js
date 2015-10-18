"use strict";

const git = require("./git");

module.exports = {
    "list": function*(data) {
        return yield git.list();
    },
    "info": function*(name) {
        return yield git.info(name);
    },
    "history": function*(options) {
        return yield git.history(options.name, options.limit, options.page);
    }
};
