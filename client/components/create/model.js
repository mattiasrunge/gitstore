"use strict";

define([
    "knockout",
    "jquery"
], function(ko, $) {
    return function(params) {
        this.name = ko.observable("");

        this.submit = function() {
            $.get("create/" + this.name(), function(data) {
                this.name("");
            }.bind(this));
        }.bind(this);
    };
});
