"use strict";

require.config({
    baseUrl: ".",
    paths: {
        text: "node_modules/requirejs-text/text",
        jquery: "node_modules/jquery/dist/jquery.min",
        knockout: "node_modules/knockout/build/output/knockout-latest",
        mdl: "node_modules/material-design-lite/material"
    }
});

var components = [
    "root",
    "list",
    "create"
];

require([
    "knockout",
    "lib/utils",
    "lib/bindings"
], function(ko, utils) {
    utils.registerComponents(components);

    var Model = function() {};

    ko.applyBindings(new Model(), document.body);
});
