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
        this.history = ko.observableArray();

        this.load = function() {
            this.history.removeAll();

            if (this.name()) {
                socket.emit("info", this.name(), function(error, info) {
                    if (error) {
                        console.error(error);
                        return;
                    }

                    this.info(info);

                    socket.emit("history", this.name(), function(error, history) {
                        if (error) {
                            console.error(error);
                            return;
                        }

                        this.history(history);
                    }.bind(this));
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
