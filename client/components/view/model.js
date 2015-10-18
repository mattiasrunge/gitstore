"use strict";

define([
    "knockout",
    "mfw/socket",
    "mfw/status"
], function(ko, socket, status) {
    return function(params) {
        this.name = ko.pureComputed(function() {
            return ko.unwrap(params.name);
        });
        this.info = ko.observable(false);
        this.history = ko.observableArray();
        this.status = status.create();

        this.load = function() {
            this.history.removeAll();

            if (this.name()) {
                this.status.loading(true);
                socket.emit("info", this.name(), function(error, info) {
                    this.status.loading(false);
                    if (error) {
                        console.error(error);
                        this.status.error(error);
                        return;
                    }

                    this.info(info);

                    this.status.loading(true);
                    socket.emit("history", this.name(), function(error, history) {
                        this.status.loading(false);
                        if (error) {
                            console.error(error);
                            this.status.error(error);
                            return;
                        }

                        for (var n = 0; n < history.length; n++) {
                            history[n] = history[n]
                            .replace(/^(.*?:)/gm, "<strong>$1</strong>")
                            .replace(/^(.*\|.*?)([\+]+)/gm, "$1<strong class='text[DASH]success'>$2</strong>")
                            .replace(/^(.*\|.*?)([\-]+)/gm, "$1<strong class='text[DASH]danger'>$2</strong>")
                            .replace(/(\[DASH\])/gm, "-")
                            .replace(/(\n)$/g, "");
                        }

                        this.history(history);
                    }.bind(this));
                }.bind(this));
            } else {
                this.info(false);
            }
        }.bind(this);

        this.update = function(name) {
            if (name === this.name()) {
                this.load();
            }
        }.bind(this);

        var s = this.name.subscribe(this.load);
        socket.on("update", this.update);

        this.load();

        this.dispose = function() {
            s.dispose();
            socket.off("update", this.update);
            status.destroy(this.status);
        };
    };
});
