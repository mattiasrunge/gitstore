"use strict";

define([
    "knockout",
    "lib/location"
], function(ko, location) {
    return function() {
        this.name = ko.pureComputed(function() {
            return location.current() && location.current().name ? location.current().name : false;
        });
    };
});
