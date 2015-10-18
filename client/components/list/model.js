"use strict";

define([
    "knockout",
    "mfw/socket"
], function(ko, socket) {
    return function() {
        this.list = ko.observableArray();

        this.load = function() {
            socket.emit("list", {}, function(error, list) {
                if (error) {
                    console.error(error);
                    return;
                }

                list.sort(function(a, b) {
                    return b.info.date.localeCompare(a.info.date);
                });

                console.log("list", list);

                this.list(list);
            }.bind(this));
        }.bind(this);

        socket.on("update", this.load);

        this.load();

        this.dispose = function() {
            socket.off("update", this.load);
        };
    };
});
