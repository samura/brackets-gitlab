define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        Strings = require( 'modules/Strings' ),
        ErrorHandler = require( 'modules/ErrorHandler' ),

        gitlabDomain = new NodeDomain("gitlab", ExtensionUtils.getModulePath(module, "../node/GitlabDomain")),
        preferences;

    function _error(err) {
        console.error(Strings.GITLAB_ERROR);
        console.log(err);
    }

    function _project_error(err) {
        console.error(Strings.GITLAB_ERROR);
        console.log(err);
        ErrorHandler.showError(err, Strings.PROJECT_ERROR);
        _clearProject();
        _clearIssue();
    }

    function _issue_error(err) {
        ErrorHandler.showError(err, Strings.ISSUE_ERROR);
        _clearIssue();
    }

    function _clearProject() {
        preferences.set( 'project', undefined, { location: { scope: 'project' } });
        preferences.save();
    }

    function _getProjects( callback ) {
        console.log('get projects');
        gitlabDomain.exec("projectsList")
            .done(callback)
            .fail(_error);
    }

    function _getProject( id, callback) {
        console.log('get project');
        gitlabDomain.exec("projectGet", id)
            .done(callback)
            .fail(_project_error);
    }

    function _getIssues( id, callback ) {
        console.log('get issues');
        gitlabDomain.exec("issuesList", id)
            .done(callback)
            .fail(_error);
    }

    function _getIssue( projectId, issueId,  callback) {
        console.log('get issue');
        gitlabDomain.exec("issueGet", projectId, issueId).done(function(issue) {
            if(issue.state === 'opened') {
                callback(issue);
            }
            else {
                _issue_error(Strings.CLOSED_ISSUE_ERROR);
            }
        }).fail(_issue_error);
    }

    function _clearIssue() {
        preferences.set( 'issue', undefined, { location: { scope: 'project' } });
        preferences.save();
    }

    function _update() {
        var project = preferences.get( 'project' );
        var issue = preferences.get( 'issue' );

        if(typeof project !== 'undefined') {
            exports.getProjectAndSave(project.id, function() {
                if(typeof issue !== 'undefined') {
                    exports.getIssueAndSave(project.id, issue.id);
                }
            });
        }
    }

    /** Exports **/
    exports.init = function(prefs) {
        preferences = prefs;

        var auth = {
            apiUrl: preferences.get( 'apiUrl' ),
            privateKey: preferences.get( 'privateKey' )
        };

        var dataUpdateTime = preferences.get( 'dataUpdateTime');

        gitlabDomain
            .exec("connect", auth)
            .done()
            .fail(_error);

        setInterval(_update, dataUpdateTime * 60000);
    };

    /**
     * Clear the project you were working on
     */
    exports.clearProject = _clearProject;

    /**
     * Gets the list of projects
     * @param {function} callback
     */
    exports.projects = _getProjects;

    /**
     * Gets full information of a project
     * @param {number} id Project ID
     * @param {function} callback
     */
    exports.project = _getProject;

    /**
     * Gets full information of a project and save it to prefs.
     * @param {number} id Project ID
     * @param {function} callback
     */
    exports.getProjectAndSave = function( id , callback){
        _getProject(id, function(project) {
            preferences.set('project', project, { location: { scope: 'project' } });
            preferences.save();
            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    /**
     * Clear the issue you were working on
     */
    exports.clearIssue = _clearIssue;

    /**
     * Get the issues list of the selected project
     * @param {number} id Project ID
     * @param {function} callback
     */
    exports.issues = _getIssues;

    /**
     * Get the full issue information
     * @param {number} id Issue ID
     * @param {function} callback
     */
    exports.issue = _getIssue;


    exports.getIssueAndSave = function (projectId, issueId, callback) {
        // get the updated information on the project
        _getIssue( projectId, issueId, function( issue ){
            console.log(preferences);
            preferences.set('issue', issue, { location: { scope: 'project' } });
            preferences.save();
            if (typeof callback === 'function') {
                callback();
            }
        } );
    };

    /**
     * Get the notes list of the selected issue
     * @param {number} id Project ID
     * @param {function} callback
     */
    exports.notes = function( projectId, issueId, callback ) {
        console.log('get notes');
        gitlabDomain.exec('notesList', projectId, issueId)
            .done(callback)
            .fail(_error);
    };
});
