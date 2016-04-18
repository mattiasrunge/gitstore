"use strict";

define([
    "knockout",
    "mfw/utils"
], function(ko, utils) {
    ko.bindingHandlers.copyToClipboard = {
        init: function(element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());

            $(element).on("click", function() {
                utils.copyToClipboard(value);
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).off("click");
            });
        }
    };
});
