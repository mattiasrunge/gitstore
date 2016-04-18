"use strict";

define([
    "knockout"
], function(ko) {

    var clipBoardContent = false;
    document.addEventListener("copy", function(e) {
        if (clipBoardContent) {
            e.clipboardData.setData("text/plain", clipBoardContent);
            e.preventDefault();
            clipBoardContent = false;
        }
    });

    var Me = function() {
        this.registerComponents = function(list) {
            list.forEach(function(name) {
                ko.components.register(name, {
                    viewModel: { require: "components/" + name + "/model" },
                    template: { require: "text!components/" + name + "/template.html" }
                });
            });
        };

        this.copyToClipboard = function(content) {
            clipBoardContent = content;
            document.execCommand("copy");
        };
    };

    return new Me();
});
