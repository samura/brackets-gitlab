define( function( require, exports ) {
    'use strict';

    // status bar
    var StatusBar = brackets.getModule( 'widgets/StatusBar' ),
        PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),

        // Extension Modules.
        Gitlab = require( 'modules/Gitlab' ),
        Strings = require( 'modules/Strings' ),
        DropdownButton = brackets.getModule( 'widgets/DropdownButton' ).DropdownButton,

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
            preferences.set( 'issue', undefined );
            preferences.save();
        });
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
        issueActions = new DropdownButton( issue.title, [] );
        issueActions.$button.addClass( 'btn-status-bar' );
        $indicator.html( issueActions.$button );
        StatusBar.updateIndicator( 'samura.gitlab', true, '', issue.title );

        // save the selected gitlab issue
//        issueActions.on( 'select', _issueSelected );
    }

    /**
	 * Exposed method to init
	 */
    exports.init = function( prefs ) {
    };
} );
