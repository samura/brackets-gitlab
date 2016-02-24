define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        EventDispatcher = brackets.getModule("utils/EventDispatcher"),
        Strings = require( 'modules/Strings' ),

        gitlabDomain = new NodeDomain("gitlab", ExtensionUtils.getModulePath(module, "../node/GitlabDomain")),
        preferences;

    function _error(err) {
        console.error(Strings.GITLAB_ERROR);
        console.log(err);
    }

    exports.init  = function(prefs) {

        preferences = prefs;

        var auth = {
            apiUrl: preferences.get( 'apiUrl' ),
            privateKey: preferences.get( 'privateKey' )
        };

        gitlabDomain
            .exec("connect", auth)
            .done()
            .fail(_error);
    };

    /**
     * Gets the list of projects
     * @param {function} callback
     */
    exports.projects = function( callback ) {
        console.log('get projects');
        gitlabDomain.exec("projectsList")
            .done(callback)
            .fail(_error);
    };

    /**
     * Gets full information of a project
     * @param {number} id Project ID
     * @param {function} callback
     */
    exports.project = function( id, callback ) {
        console.log('get project');
        gitlabDomain.exec("projectGet", id)
            .done(callback)
            .fail(_error);
    };

    exports.getProjectAndSave = function( id ){
        exports.project(id, function(project) {
            preferences.set('project', project, { location: { scope: 'project' } });
            preferences.save();
        });
    };

    /**
     * Get the issues list of the selected project
     * @param {number} id Project ID
     * @param {function} callback
     */
    exports.issues = function( id, callback ) {
        console.log('get issues');
        gitlabDomain.exec("issuesList", id)
            .done(callback)
            .fail(_error);
    };

    /**
     * Get the full issue information
     * @param {number} id Issue ID
     * @param {function} callback
     */
    exports.issue = function( projectId, issueId,  callback ) {
        console.log('get issue');
        gitlabDomain.exec("issueGet", projectId, issueId)
            .done(callback)
            .fail(_error);
    };


    exports.getIssueAndSave = function (projectId, issueId) {
        // get the updated information on the project
        exports.issue( projectId, issueId, function( issue ){

            console.log(preferences);
            preferences.set('issue', issue, { location: { scope: 'project' } });
            preferences.save();
        } );
    };

    EventDispatcher.makeEventDispatcher(this);
});
