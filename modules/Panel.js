define(function (require, exports) {
    "use strict";

    var WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Strings = require( 'modules/Strings' ),
        Gitlab = require( 'modules/Gitlab' ),
        Git = require( 'modules/Git' ),
        Resizer = brackets.getModule("utils/Resizer"),
        marked = require("lib/marked"),

        gitPanelTemplate = require("text!html/panel.html"),
        gitPanelIssueTemplate = require("text!html/panel-issue.html"),
        gitPanelNotesTemplate = require("text!html/panel-notes.html"),

        PANEL_ID = 'samura.brackets-gitlab.statusbar',

        gitPanel = null,
        $gitPanel = $(null),
        project,
        issue,
        panel,
        preferences
    ;

    /**
     * Show the panel
     */
    function _toggle () {
        if( !panel ) {
            _show();
        } else {
            _hide();
        }
    }

    /**
     * Show the panel
     */
    function _show () {
        panel = true;
        preferences.set( 'openPanel', true );
        preferences.save();
        Resizer.show($gitPanel);
    }

    /**
     * Hide the panel
     */
    function _hide () {
        panel = false;
        preferences.set( 'openPanel', false );
        preferences.save();
        Resizer.hide($gitPanel);
    }

    function _disableBtn ( btn ) {
        btn.prop('disabled', true).addClass('btn-loading');
    }

    function _enableBtn ( btn ) {
        btn.prop('disabled', false).removeClass('btn-loading');
    }

    /**
     * Render the issue and notes
     */
    function _renderIssueAndNotes () {

        if( issue ) {

            $gitPanel.find('#open-on-gitlab').attr('href', project.web_url + '/issues/' + issue.iid);

            // render the left side of the panel - issue information
            var panelIssueHtml = Mustache.render(gitPanelIssueTemplate, {
                title: issue.title,
                description: marked(issue.description)
            });

            $gitPanel.find('.issue').html(panelIssueHtml);

            // render the right side of the panel - notes information
            Gitlab.notes( issue.project_id, issue.id, function( notes ) {

                function compare(a,b) {
                    var c = new Date(Date.parse(a.created_at)),
                        d = new Date(Date.parse(b.created_at));

                    return (c.getTime() < d.getTime()) ? 1 : -1;
                }
                notes.sort(compare);

                // render the left side of the panel - issue information
                var panelNotesHtml = Mustache.render(gitPanelNotesTemplate, {
                    notes: notes,
                    renderNote: function() {
                        return marked(this.body);
                    },
                    formatDate: function() {
                        var date = new Date(Date.parse(this.created_at));
                        return date.toLocaleString();
                    }
                });

                $gitPanel.find('.notes').html(panelNotesHtml);
                _enableBtn( $gitPanel.find('#refresh') );
            } );
        }
    }

    /**
     * Build the panel
     */
    exports.init = function ( prefs ) {

        preferences = prefs;
        panel = preferences.get( 'openPanel' );

        // Add panel
        var panelHtml = Mustache.render(gitPanelTemplate, {
            Strings: Strings
        });
        var $panelHtml = $(panelHtml);

        gitPanel = WorkspaceManager.createBottomPanel(PANEL_ID, $panelHtml, 100);
        $gitPanel = gitPanel.$panel;

        // set same state as it was on last brackets start
        if( panel ) {
            _show();
        }

        // triggers
        $gitPanel.on("click", "#close", _hide);
        $gitPanel.on("click", "#close-issue", function() {
            Git.closeIssue( issue );
        });
        $gitPanel.on("click", "#mention-issue", function() {
            Git.mentionIssue(issue );
        });
        $gitPanel.on("click", "#refresh", function() {
            $gitPanel.find('.issue,.notes').html('loading...');
            _disableBtn( $gitPanel.find('#refresh') );
            Gitlab.getIssueAndSave( issue.project_id, issue.id, function(){
                _renderIssueAndNotes();
            });
        });

        preferences.on('change', function() {
            project = preferences.get( 'project' );
            issue = preferences.get( 'issue' );

            _renderIssueAndNotes();
        });
    };

    exports.show = _show;
    exports.close = _hide;
    exports.toggle = _toggle;
});
