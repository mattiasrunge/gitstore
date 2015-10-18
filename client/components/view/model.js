"use strict";

define([
    "knockout",
    "moment",
    "mfw/socket",
    "mfw/status",
    "mfw/location"
], function(ko, moment, socket, status, location) {
    return function(params) {
        this.limit = ko.observable(5);
        this.name = ko.pureComputed(function() {
            return location.current() && location.current().name ? location.current().name : false;
        });
        this.page = ko.pureComputed(function() {
            return parseInt(location.current() && location.current().page ? location.current().page : 0, 10);
        });
        this.info = ko.observable(false);
        this.history = ko.observableArray();
        this.status = status.create();

        this.next = function() {
            location.goto({ page: this.page() + 1 });
        };

        this.previous = function() {
            if (this.page() === 1) {
                location.goto({ page: null });
            } else {
                location.goto({ page: this.page() - 1 });
            }
        };

        this.load = function() {
            this.history.removeAll();

            if (this.name()) {
                this.status(true);
                socket.emit("info", this.name(), function(error, info) {
                    this.status(false);
                    if (error) {
                        status.printError(error);
                        return;
                    }

                    this.info(info);

                    var options = {
                        name: this.name(),
                        limit: this.limit(),
                        page: this.page()
                    };

                    this.status(true);
                    socket.emit("history", options, function(error, history) {
                        this.status(false);
                        if (error) {
                            status.printError(error);
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
            if (name === this.name() && this.page() === 0) {
                this.load();
            }
        }.bind(this);

        var s1 = this.name.subscribe(this.load);
        var s2 = this.page.subscribe(this.load);
        socket.on("update", this.update);

        this.load();

        this.dispose = function() {
            s1.dispose();
            s2.dispose();
            socket.off("update", this.update);
            status.destroy(this.status);
        };
    };
});
