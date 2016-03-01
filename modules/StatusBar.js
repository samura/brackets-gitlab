define( function( require, exports ) {
    'use strict';

    // status bar
    var StatusBar = brackets.getModule( 'widgets/StatusBar' ),
        NativeApp = brackets.getModule( 'utils/NativeApp' ),

        // Extension Modules.
        Gitlab = require( 'modules/Gitlab' ),
        Strings = require( 'modules/Strings' ),
        Git = require( 'modules/Git' ),
        Panel = require( 'modules/Panel' ),
        DropdownButton = brackets.getModule( 'widgets/DropdownButton' ).DropdownButton,

        // dropdown values
        issueActionList = [Strings.SELECT_OTHER_ISSUE, Strings.OPEN_PROJECT, '---', Strings.CLOSE_ISSUE, Strings.MENTION_ISSUE],

        // Variables.
        $indicator  = $(null),
        projectSelect, // html <select>
        baseIssueOptions = [Strings.SELECT_OTHER_PROJECT, '---'],
        issueOptions,
        projectList,
        preferences,
        issueSelect, // html <select>
        issueList, // project objects
        issueActions,
        project,
        issue,

        STATUS_BAR_ID = 'samura.brackets-gitlab.statusbar'
    ;

    /**
     * populate the select box with projects
     */
    function _populateProjects() {
        Gitlab.projects(function( projects ){

            projectList = projects;

            var projectOptions = [];
            projects.forEach(function(item, index) {
                projectOptions[index] = item.name_with_namespace + ' (' + item.open_issues_count + ')';
            });
            projectSelect.items = projectOptions;
            projectSelect.refresh();
        });
    }

    /**
     * populate the select box with projects
     */
    function _populateIssues( project ) {
        Gitlab.issues(project.id, function( issues ){

            issueList = issues;
            // copy the base options
            issueOptions = baseIssueOptions.slice();

            issues.forEach(function(item) {
                var label = item.title;
                if(item.assignee) {
                    label += ' (' + item.assignee.name + ')';
                }

                issueOptions.push( label );
            });

            // if no issue
            if ( issues.length === 0 ) {
                issueOptions.push( Strings.NO_MORE_ISSUES );
            }

            issueSelect.items = issueOptions;
            issueSelect.refresh();
        });
    }

    /**
     * Retrieve updated project information
     * @param Event select DOM Object
     * @param String label selected item
     * @param Integer index Selected item index
     */
    function _projectSelected(select, label, index) {
        Gitlab.getProjectAndSave( projectList[index].id );
        Gitlab.clearIssue();
    }

    /**
     * Retrieve updated issue information
     * @param Event select DOM Object
     * @param String label selected item
     * @param Integer index Selected item index
     */
    function _issueSelected(select, label, index) {

        if(label === Strings.SELECT_OTHER_PROJECT) {
            Gitlab.clearProject();
            return;
        }

        Gitlab.getIssueAndSave( project.id, issueList[index-baseIssueOptions.length].id );
    }

    /**
     * Retrieve updated issue information
     * @param Event select DOM Object
     * @param String label selected item
     */
    function _issueAction(select, label) {

        switch(label) {
            case Strings.CLOSE_ISSUE: // close issue
                Git.closeIssue( issue );
                break;
            case Strings.MENTION_ISSUE: // close issue
                Git.mentionIssue( issue );
                break;
            case Strings.SELECT_OTHER_ISSUE: // select another
                Gitlab.clearIssue();
                break;
            case Strings.OPEN_PROJECT: // select another
                NativeApp.openURLInDefaultBrowser(project.web_url);
                break;
        }
    }

    /**
     * Show dropdown with available projects
     */
    function _renderProjectSelect() {
        // set the dropdown and select event listeners
        projectSelect = new DropdownButton(Strings.SELECT_PROJECT, []);
        projectSelect.$button.addClass('btn-status-bar');
        _populateProjects();
        $indicator.html( projectSelect.$button );
        StatusBar.updateIndicator( STATUS_BAR_ID, true, '', Strings.SELECT_ISSUE );

        // save the selected gitlab project
        projectSelect.on('select', _projectSelected);
    }

    /**
     * Renders a list of open issues to select from
     * @param object project Selected project
     */
    function _renderIssueSelect( project ) {

        // set the dropdown and select event listeners
        issueSelect = new DropdownButton( Strings.SELECT_ISSUE, [], _renderItem );
        issueSelect.$button.addClass( 'btn-status-bar' );
        _populateIssues( project );
        $indicator.html( issueSelect.$button );
        StatusBar.updateIndicator( STATUS_BAR_ID, true, '', Strings.SELECT_ISSUE );

        // save the selected gitlab issue
        issueSelect.on( 'select', _issueSelected );
    }

    /**
     * Renders a list of open issues to select from
     * @param object project Selected project
     */
    function _renderIssue( issue ) {
        // set the dropdown and select event listeners
        issueActions = new DropdownButton( issue.title, issueActionList);
        issueActions.$button.addClass( 'btn-status-bar' );
        var $view = $('<span class="view-issue"></span>');
        $indicator.html( $view );

        $indicator.append( issueActions.$button );
        StatusBar.updateIndicator( STATUS_BAR_ID, true, '', issue.title );

        // save the selected gitlab issue
        issueActions.on( 'select', _issueAction );
        $view.on( 'click', Panel.toggle );
    }

    /**
     * render items: active or disabled
     */
    function _renderItem(item) {

        if(item === Strings.NO_MORE_ISSUES) {
            return { html: Strings.NO_MORE_ISSUES, active: false };
        }

        return item;
    }

    /**
     * base render method
     */
    function _render(event, data) {
        // only changes on the project or issue
        if(typeof data !== 'undefined' &&
           data.ids.indexOf('project') === -1 &&
           data.ids.indexOf('issue') === -1) {
            return;
        }

        project = preferences.get( 'project' );
        issue = preferences.get( 'issue' );

        console.log('detected something');
        // if project changed
        if (!project) {
            _renderProjectSelect();
        } else if (!issue) {
            _renderIssueSelect( project );
        } else if (issue) {
            _renderIssue( issue );
        }
    }

    /**
	 * Exposed method to show dialog.
	 */
    exports.init = function( prefs ) {
        preferences = prefs;

        $indicator = $( '<div>' );
        StatusBar.addIndicator( STATUS_BAR_ID, $indicator, true, '', Strings.EXTENSION_NAME );

        // detect preferences changes
        preferences.on('change', _render);
        _render();
    };
} );
