"use strict";

define([
    "knockout",
    "mprogress",
    "jquery",
    "snackbar"
], function(ko, Mprogress, $) {
    var Me = function() {
        var mprogress = new Mprogress({ template: 4 });
        var list = ko.observableArray();

        this.printError = function(text) {
            console.error(text);

            var options =  {
                content: "<strong>Error:</strong> " + text,
                style: "alert-danger",
                timeout: 10000,
                htmlAllowed: true
            }

            $.snackbar(options).snackbar("show");
        };

        this.printSuccess = function(text) {
            console.log(text);

            var options =  {
                content: "<strong>Success:<//strong> " + text,
                style: "alert-success",
                timeout: 5000,
                htmlAllowed: true
            }

            $.snackbar(options).snackbar("show");
        };

        this.printWarning = function(text) {
            console.log(text);

            var options =  {
                content: "<strong>Warning:<//strong> " + text,
                style: "alert-warning",
                timeout: 5000,
                htmlAllowed: true
            }

            $.snackbar(options).snackbar("show");
        };

        this.printInfo = function(text) {
            console.log(text);

            var options =  {
                content: "<strong>Information:<//strong> " + text,
                style: "alert-info",
                timeout: 5000,
                htmlAllowed: true
            }

            $.snackbar(options).snackbar("show");
        };

        this.create = function() {
            var status = ko.observable(false);
            list.push(status);
            return status;
        };

        this.destroy = function(status) {
            list.remove(status);
        };

        ko.computed(function() {
            var loading = list().filter(function(status) {
                return status();
            }).length > 0;

            if (loading) {
                mprogress.start();
            } else {
                mprogress.end();
            }
        });
    };

    return new Me();
});
