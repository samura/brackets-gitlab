define( function( require, exports ) {
    'use strict';

    // status bar
    var StatusBar = brackets.getModule( 'widgets/StatusBar' ),
        PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),

        // Extension Modules.
        Gitlab = require( 'modules/Gitlab' ),
        Strings = require( 'modules/Strings' ),
        Git = require( 'modules/Git' ),
        DropdownButton = brackets.getModule( 'widgets/DropdownButton' ).DropdownButton,

        // dropdown values
        issueActionList = [Strings.SELECT_OTHER_ISSUE, '---', Strings.CLOSE_ISSUE, Strings.MENTION_ISSUE],

        // Variables.
        $indicator,
        projectSelect, // html <select>
        projectList,
        preferences,
        issueSelect, // html <select>
        issueList, // project objects
        issueActions
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

            var issueOptions = [];
            issues.forEach(function(item, index) {
                issueOptions[index] = item.title;
                if(item.assignee) {
                    issueOptions[index] += ' (' + item.assignee.name + ')';
                }
            });
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
        console.log(typeof select); // escrever acima!!!!!!
        // get the updated information on the project
        Gitlab.project(projectList[index].id, function( project ){

            preferences.set('project', project, { location: { scope: 'project' } });
            // remove selected issue when changing project
            _clearIssue();
        });
    }

    /**
     * Clear the issue you were working on
     */
    function _clearIssue() {
        preferences.set( 'issue', undefined, { location: { scope: 'project' } });
        preferences.save();
    }

    /**
     * Retrieve updated issue information
     * @param Event select DOM Object
     * @param String label selected item
     * @param Integer index Selected item index
     */
    function _issueSelected(select, label, index) {

        var project = preferences.get( 'project' );
        // get the updated information on the project
        console.log(issueList[index].id);
        Gitlab.issue( project.id, issueList[index].id, function( issue ){

            preferences.set('issue', issue, { location: { scope: 'project' } });
            preferences.save();
        } );
    }

    /**
     * Retrieve updated issue information
     * @param Event select DOM Object
     * @param String label selected item
     * @param Integer index Selected item index
     */
    function _issueAction(select, label, index) {

        switch(label) {
            case Strings.CLOSE_ISSUE: // close issue
                Git.closeIssue( preferences.get( 'issue' ) );
                break;
            case Strings.MENTION_ISSUE: // close issue
                Git.mentionIssue( preferences.get( 'issue' ) );
                break;
            case Strings.SELECT_OTHER_ISSUE: // select another
                _clearIssue();
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
        StatusBar.updateIndicator( 'samura.gitlab', true, '', Strings.SELECT_ISSUE );

        // save the selected gitlab project
        projectSelect.on('select', _projectSelected);
    }

    /**
     * Renders a list of open issues to select from
     * @param object project Selected project
     */
    function _renderIssueSelect( project ) {

        // set the dropdown and select event listeners
        issueSelect = new DropdownButton( Strings.SELECT_ISSUE, [] );
        issueSelect.$button.addClass( 'btn-status-bar' );
        _populateIssues( project );
        $indicator.html( issueSelect.$button );
        StatusBar.updateIndicator( 'samura.gitlab', true, '', Strings.SELECT_ISSUE );

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
        $indicator.html( issueActions.$button );
        StatusBar.updateIndicator( 'samura.gitlab', true, '', issue.title );

        // save the selected gitlab issue
        issueActions.on( 'select', _issueAction );
    }

    /**
	 * Exposed method to show dialog.
	 */
    exports.init = function( prefs ) {
        preferences = prefs;

        // detect preferences changes
        preferences.on('change', function(event, changes) {

            var project = preferences.get( 'project' );
            var issue = preferences.get( 'issue' );

            console.log(typeof changes.ids);
            // if project changed
            if(changes.ids.indexOf('project') !== -1) {
                if (!project) {
                    _renderProjectSelect();
                } else {
                    _renderIssueSelect( project );
                }
            }

            // if issue changed
            if(changes.ids.indexOf('issue') !== -1) {
                if (!issue) {
                    _renderIssueSelect( project );
                } else {
                    _renderIssue( issue );
                }
            }
            console.log(preferences.get( 'project' ));
        });

        $indicator = $( '<div>' );
        StatusBar.addIndicator('samura.gitlab', $indicator, true, '', Strings.EXTENSION_NAME );
        _renderProjectSelect();
    };
} );
