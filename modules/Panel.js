/*jshint maxstatements:false*/

define(function (require, exports) {
    "use strict";

    var WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Strings = require( 'modules/Strings' ),
        Resizer = brackets.getModule("utils/Resizer"),

        gitPanelTemplate = require("text!html/panel.html"),
        gitPanel = null,
        $gitPanel = $(null),
        
        PANEL_ID = 'samura.brackets-gitlab.statusbar'
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
    exports.init = function () {
        // Add panel
        var panelHtml = Mustache.render(gitPanelTemplate, {
            Strings: Strings
        });
        var $panelHtml = $(panelHtml);
        
        gitPanel = WorkspaceManager.createBottomPanel(PANEL_ID, $panelHtml, 100);
        $gitPanel = gitPanel.$panel;
        
        $gitPanel.on("click", "#close", function () {
            _hide();
        });
    };
    
    /**
     * open the panel
     */
    exports.show = _show;
});
