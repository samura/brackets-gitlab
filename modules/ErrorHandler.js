define(function (require, exports) {
    'use strict';

    var Dialogs                    = brackets.getModule('widgets/Dialogs'),
        Strings                    = require('modules/Strings'),
        Utils                      = require('modules/Utils'),
        errorDialogTemplate        = require('text!html/error-dialog.html');


        Gitlab = require( 'modules/Gitlab' ),
        Strings = require( 'modules/Strings' ),
        Git = require( 'modules/Git' ),

    function _errorToString(err) {
        var body;

        if (typeof err === 'string') {
            body = err;
        } else if (err instanceof Error) {
            body = Utils.encodeSensitiveInformation(err.toString());
        }

        if (!body || body === '[object Object]') {
            try {
                body = JSON.stringify(err, null, 4);
            } catch (e) {
                body = 'Error!';
                console.error('Error can\'t be stringified by JSON.stringify');
            }
        }

        return body;
    }

    exports.contains = function (err, what) {
        return err.toString().toLowerCase().indexOf(what.toLowerCase()) !== -1;
    };

    exports.showError = function (err, title, callback) {
        var dialog,
            body;

        // Default code
//        if(typeof callback === 'undefined') {
//            callback = function (buttonId) {
//            }
//        }

        body = _errorToString(err);

        var compiledTemplate = Mustache.render(errorDialogTemplate, {
            title: title,
            body: body,
            Strings: Strings
        });

        dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);

        dialog.done(callback);
    };

});
