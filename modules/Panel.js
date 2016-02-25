/*jshint maxstatements:false*/

define(function (require, exports) {
    "use strict";

    var WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Strings = require( 'modules/Strings' ),
        Resizer = brackets.getModule("utils/Resizer"),
        marked = require("lib/marked"),

        gitPanelTemplate = require("text!html/panel.html"),
        gitPanelIssueTemplate = require("text!html/panel-issue.html"),

        PANEL_ID = 'samura.brackets-gitlab.statusbar',

        gitPanel = null,
        $gitPanel = $(null),
        preferences        
    ;

    /**
     * Show the panel
     */
    function _show () {
        Resizer.show($gitPanel);
    };

    /**
     * Hide the panel
     */
    function _hide () {
        Resizer.hide($gitPanel);
    };

    /**
     * Build the panel
     */
    exports.init = function ( prefs ) {
        
        preferences = prefs;
        
        // Add panel
        var panelHtml = Mustache.render(gitPanelTemplate, {});
        var $panelHtml = $(panelHtml);

        gitPanel = WorkspaceManager.createBottomPanel(PANEL_ID, $panelHtml, 100);
        $gitPanel = gitPanel.$panel;

        $gitPanel.on("click", "#close", function () {
            _hide();
        });

        preferences.on('change', function() {
            var issue = preferences.get( 'issue' );

            if( issue ) {
                
                // render the left side of the panel - issue information
                var panelIssueHtml = Mustache.render(gitPanelIssueTemplate, {
                    title: issue.title,
                    description: marked(issue.description)
                });
                
                $gitPanel.find('.issue').html(panelIssueHtml);
                
                // render the right side of the panel - comments information
            }
        });
    };

    /**
     * open the panel
     */
    exports.show = _show;
});
