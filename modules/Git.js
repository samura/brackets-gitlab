define( function( require, exports ) {
    'use strict';

    var Strings = require( 'modules/Strings' );

    function _doCommit ( message ) {
        // open the panel
        $('#git-toolbar-icon:not(.on)').click();

        // select all files
        if(!$('.check-all.git-available').prop('checked')) {
            $('.check-all.git-available').click();
        }

        // check when the commit button is available for a minute
        setTimeout(function(){
            var tries = 0;
            var commitButtonEvent = setInterval(function(){
                // keep trying
                if($('.git-commit').prop("disabled")) {
                    if(tries < 600) {
                        tries++;
                    } else {
                        // give up
                        clearInterval(commitButtonEvent);
                    }
                    return;
                }

                // success!
                clearInterval(commitButtonEvent);
                $('.git-commit').click();
            }, 100);

        }, 0);
        // write the commit message
        $('body').on('focus', '*[name=commit-message]', function() {
            $(this).val( message );
            // stop writting the same message when regaining focus
            $('body').off('focus', '*[name=commit-message]');
        });
    }

    /**
     * close issue
     */
    exports.closeIssue = function ( issue ) {

        // had to do this on another line because it was not indenting right
        var message;
        // set the commit message
        message = Strings
            .COMMIT_MESSAGE_CLOSE
            .replace('#ID#', issue.iid)
            .replace('#TITLE#', issue.title);

        _doCommit( message );
    };

    /**
     * Commit the modified files with a message mentioning the issue #
     */
    exports.mentionIssue = function ( issue) {

        // had to do this on another line because it was not indenting right
        var message;
        // set the commit message
        message = Strings
            .COMMIT_MESSAGE_MENTION
            .replace('#ID#', issue.id)
            .replace('#TITLE#', issue.title);

        _doCommit( message );
    }

    /**
	 * Exposed method to init
	 */
    exports.init = function( prefs ) {
    };
} );
