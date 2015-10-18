"use strict";

define([
    "knockout",
    "mfw/socket",
    "mfw/status"
], function(ko, socket, status) {
    return function() {
        this.list = ko.observableArray();
        this.status = status.create();

        this.load = function() {
            this.status(true);
            socket.emit("list", {}, function(error, list) {
                this.status(false);

                if (error) {
                    status.printError(error);
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
            status.destroy(this.status);
        };
    };
});
