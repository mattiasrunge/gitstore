"use strict";

define([
    "knockout"
], function(ko) {
    var Me = function() {
        this.registerComponents = function(list) {
            list.forEach(function(name) {
                ko.components.register(name, {
                    viewModel: { require: "components/" + name + "/model" },
                    template: { require: "text!components/" + name + "/template.html" }
                });
            });
        };
    };

    return new Me();
});
