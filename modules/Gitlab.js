define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        Strings = require( 'modules/Strings' ),

        gitlabDomain = new NodeDomain("gitlab", ExtensionUtils.getModulePath(module, "../node/GitlabDomain")),
        preferences;

    function _error(err) {
        console.error(Strings.GITLAB_ERROR);
        console.log(err);
    }

    function _issue_error(err) {
        console.error(Strings.GITLAB_ERROR);
        console.log(err);
    }

    exports.init  = function(prefs) {

        preferences = prefs;

        gitlabDomain
            .exec("connect", preferences)
        // get the list of projects
            .done(exports.projects)
            .fail(_error);

        setInterval(function() {

        }, 100);
    };

    /**
     * Gets the list of projects
     * @param {function} callback
     */
    exports.projects = function( callback ) {
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
        gitlabDomain.exec("projectGet", id)
            .done(callback)
            .fail(_error);
    };

    /**
     * Get the issues list of the selected project
     * @param {number} id Project ID
     * @param {function} callback
     */
    exports.issues = function( id, callback ) {
        gitlabDomain.exec("issuesList", id)
            .done(callback)
            .fail(_error);
    }

    /**
     * Get the full issue information
     * @param {number} id Issue ID
     * @param {function} callback
     */
    exports.issue = function( projectId, issueId,  callback ) {
        gitlabDomain.exec("issueGet", projectId, issueId)
            .done(callback)
            .fail(_issue_error);
    }

});
