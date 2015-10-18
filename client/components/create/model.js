"use strict";

define([
    "knockout",
    "jquery",
    "mfw/status"
], function(ko, $, status) {
    return function(params) {
        this.name = ko.observable("");
        this.status = status.create();

        this.submit = function() {
            if (this.name() === "") {
                this.status.error("Repository name can not be empty");
                return false;
            }

            this.status(true);

            $.get("create/" + this.name())
            .done(function(data) {
                this.name("");
                $("#createModal").modal("hide");
                status.printSuccess("Created new repository named " + this.name());
            }.bind(this))
            .fail(function(req, error, text) {
                status.printError("Failed to create repository named " + this.name() + ", error: " + text);
            }.bind(this))
            .always(function() {
                this.status(false);
            }.bind(this));
        }.bind(this);

        this.dispose = function() {
            status.destroy(this.status);
        };
    };
});
