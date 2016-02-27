define(function (require, exports) {
    "use strict";

    var WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Resizer = brackets.getModule("utils/Resizer"),
        Strings = require( 'modules/Strings' ),
        Gitlab = require( 'modules/Gitlab' ),
        Git = require( 'modules/Git' ),
        marked = require("lib/marked"),
        timeago = require("lib/timeago"),

        gitPanelTemplate = require("text!html/panel.html"),
        gitPanelIssueTemplate = require("text!html/panel-issue.html"),
        gitPanelNotesTemplate = require("text!html/panel-notes.html"),

        PANEL_ID = 'samura.brackets-gitlab.statusbar',

        gitPanel = null,
        $gitPanel = $(null),
        project,
        issue,
        panelVisibility,
        dataUpdateTime,
        preferences,
        renderUpdate
    ;

    /**
     * Show the panel
     */
    function _toggle () {
        if( !panelVisibility ) {
            _show();
        } else {
            _hide();
        }
    }

    /**
     * Show the panel
     */
    function _show () {
        panelVisibility = true;
        preferences.set( 'openPanel', true );
        preferences.save();
        Resizer.show($gitPanel);
    }

    /**
     * Hide the panel
     */
    function _hide () {
        panelVisibility = false;
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
                description: marked(issue.description),
                author: issue.author.name,
                timeago: timeago(Date.parse(issue.created_at)),
                assignee: issue.assignee
            });

            $gitPanel.find('.issue').html(panelIssueHtml);

            // render the right side of the panel - notes information
            Gitlab.notes( issue.project_id, issue.id, function( notes ) {

                function compare(a,b) {
                    return (Date.parse(a.created_at) < Date.parse(b.created_at)) ? 1 : -1;
                }
                notes.sort(compare);

                // render the left side of the panel - issue information
                var panelNotesHtml = Mustache.render(gitPanelNotesTemplate, {
                    notes: notes,
                    renderNote: function() {
                        return marked(this.body);
                    },
                    formatDate: function() {
                        return timeago(Date.parse(this.created_at));
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
        panelVisibility = preferences.get( 'openPanel' );
        dataUpdateTime = preferences.get( 'dataUpdateTime' );

        // Add panel
        var panelHtml = Mustache.render(gitPanelTemplate, {
            Strings: Strings
        });
        var $panelHtml = $(panelHtml);

        gitPanel = WorkspaceManager.createBottomPanel(PANEL_ID, $panelHtml, 100);
        $gitPanel = gitPanel.$panel;

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

        preferences.on('change', function(event, changes) {

            project = preferences.get( 'project' );
            issue = preferences.get( 'issue' );
            dataUpdateTime = preferences.get( 'dataUpdateTime' );

            // set the update interval
            if(typeof renderUpdate !== 'undefined') {
                clearInterval(renderUpdate);
            }
            renderUpdate = setInterval(_renderIssueAndNotes, dataUpdateTime * 60000);

            // only update if there's a change on the isse or the openPanel
            if( changes.ids.indexOf('issue') === -1 &&
               changes.ids.indexOf('openPanel') === -1 ) {
                return;
            }

            // only refresh information if panel is visible
            // and the objects are different
            if( panelVisibility ) {
                _show();
                _renderIssueAndNotes();
            }
        });
    };

    exports.show = _show;
    exports.close = _hide;
    exports.toggle = _toggle;
});
