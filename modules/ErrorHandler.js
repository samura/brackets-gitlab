define(function (require, exports) {
    'use strict';

    var Dialogs                    = brackets.getModule('widgets/Dialogs'),
        Strings                    = require('modules/Strings'),
        errorDialogTemplate        = require('text!html/error-dialog.html'),
        showing = {
            error: false
        };


    function _errorToString(err) {
        var body;

        if (typeof err === 'string') {
            body = err;
        } else if(err.data && err.data.resBody && err.data.resBody.message) {
            body = err.data.resBody.message;
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

        // Default callback
        if(typeof callback !== 'function') {
            callback = function (buttonId) {};
        }

        if(showing.error) {
            if(typeof callback === 'function') {
                callback();
            }
            return;
        }
        showing.error = true;

        body = _errorToString(err);

        var compiledTemplate = Mustache.render(errorDialogTemplate, {
            title: title,
            body: body,
            Strings: Strings
        });

        dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);

        dialog.done(function (buttonId) {
            showing.error = false;

            if(typeof callback === 'function') {
                callback(buttonId);
            }
        });
    };

});
