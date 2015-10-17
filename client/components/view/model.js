"use strict";

define([
    "knockout",
    "mfw/socket"
], function(ko, socket, location) {
    return function(params) {
        this.name = ko.pureComputed(function() {
            return ko.unwrap(params.name);
        });
        this.info = ko.observable(false);

        this.load = function() {
            if (this.name()) {
                socket.emit("info", this.name(), function(error, info) {
                    if (error) {
                        console.error(error);
                        return;
                    }

                    this.info(info);
                }.bind(this));
            } else {
                this.info(false);
            }
        }.bind(this);

        var s = this.name.subscribe(this.load);
        this.load();

        this.dispose = function() {
            s.dispose();
        };
    };
});
