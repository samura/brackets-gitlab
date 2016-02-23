define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        EventDispatcher = brackets.getModule("utils/EventDispatcher"),

        gitlabDomain = new NodeDomain("gitlab", ExtensionUtils.getModulePath(module, "../node/GitlabDomain")),
        preferences;

    function _error(err) {
        console.error('Could not connect to gitlab');
        console.log(err);
    }

    exports.init  = function(prefs) {

        preferences = prefs;

        gitlabDomain
            .exec("connect", preferences)
        // get the list of projects
            .done(exports.projects)
            .fail(_error);
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
            .fail(_error);
    }

    EventDispatcher.makeEventDispatcher(this);
});
