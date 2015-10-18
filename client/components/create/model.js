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

            this.status.error(false);
            this.status.loading(true);

            $.get("create/" + this.name())
            .done(function(data) {
                this.name("");
                $("#createModal").modal("hide");
            }.bind(this))
            .fail(function(req, error, text) {
                this.status.error("Failed to create repository, error: " + text);
            }.bind(this))
            .always(function() {
                this.status.loading(false);
            }.bind(this));
        }.bind(this);

        this.dispose = function() {
            status.destroy(this.status);
        };
    };
});
