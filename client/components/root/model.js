"use strict";

define([
    "knockout",
    "mfw/location",
    "lib/bindings"
], function(ko, location) {
    return function() {
        this.name = ko.pureComputed(function() {
            return location.current() && location.current().name ? location.current().name : false;
        });
    };
});
