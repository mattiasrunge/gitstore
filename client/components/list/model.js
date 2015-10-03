"use strict";

define([
    "knockout",
    "jquery"
], function(ko, $) {
    return function() {
        this.list = ko.observableArray();

        this.load = function() {
            $.getJSON("list", function(data) {
                this.list(data);
            }.bind(this));
        }.bind(this);

        this.load();
    };
});
