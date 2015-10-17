"use strict";

const git = require("./git");

module.exports = {
    "list": function*(data) {
        return yield git.list();
    }
};
