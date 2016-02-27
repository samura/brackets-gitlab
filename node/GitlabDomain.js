(function () {
    "use strict";

    var gitlab = require('node-gitlab'),

        // variables
        preferences,
        gitlabClient,
        domain
    ;

    function _projectsList ( callback ) {

        gitlabClient.projects.list({
            order_by: 'last_activity_at',
            sort: 'desc',
            per_page: 100
        }, callback);
    }

    function _issuesList ( id, callback ) {

        gitlabClient.issues.list({
            id: id,
            state: 'opened',
            per_page: 100
        }, callback);
    }

    function _notesList ( id, issueId, callback ) {

        gitlabClient.issues.listNotes({
            id: id,
            issue_id: issueId
        }, callback);
    }

    function _projectGet ( id, callback ) {

        gitlabClient.projects.get({ id: id }, callback);
    }

    function _issueGet ( projectId, issueId, callback ) {

        gitlabClient.issues.get({ id: projectId, issue_id: issueId }, callback);
    }

    /**
     * Connects to gitlab
     * @param   Object prefs Gitlab Preferences
     * @returns Object Gitlab connection
     */
    function _connect ( prefs ){

        preferences = prefs;

        gitlabClient = gitlab.create({
            api: preferences.apiUrl,
            privateToken: preferences.privateKey
        });
    }

    /**
     * Initializes the Gitlab Domain
     * @param DomainManager domainManager
     */
    function init (domainManager) {
        if (!domainManager.hasDomain("gitlab")) {
            domainManager.registerDomain("gitlab", {major: 0, minor: 1});
        }

        domain = domainManager;

        domainManager.registerCommand(
            "gitlab",
            "connect",
            _connect,
            false,
            "Returns a gitlab connection",
            [{name: 'preferences',
              type: 'object',
              description: 'Object containing url and private key'}]
        );

        domainManager.registerCommand(
            "gitlab",
            "projectsList",
            _projectsList,
            true,
            "Returns a list of gitlab projects",
            [],
            [{name: 'projects',
              type: 'array',
              description: 'A list of gitlab projects'}]
        );

        domainManager.registerCommand(
            "gitlab",
            "projectGet",
            _projectGet,
            true,
            "Returns one gitlab project",
            [{id: 'id',
              type: 'integer',
              description: 'A project ID'}],
            [{name: 'project',
              type: 'object',
              description: 'Full information off a project'}]
        );

        domainManager.registerCommand(
            "gitlab",
            "issuesList",
            _issuesList,
            true,
            "Returns a list of issues of the selected project",
            [{id: 'id',
              type: 'integer',
              description: 'A project ID'}],
            [{name: 'issues',
              type: 'array',
              description: 'A list of open issues'}]
        );

        domainManager.registerCommand(
            "gitlab",
            "issueGet",
            _issueGet,
            true,
            "Returns full information on an issue",
            [{id: 'projectId',
              type: 'integer',
              description: 'A project ID'},
             {id: 'issueId',
              type: 'integer',
              description: 'An issue ID'}],
            [{name: 'issues',
              type: 'array',
              description: 'Full issue information'}]
        );

        domainManager.registerCommand(
            "gitlab",
            "notesList",
            _notesList,
            true,
            "Returns a list of notes of the specified issue",
            [{id: 'id',
              type: 'integer',
              description: 'A project ID'},
             {id: 'issueId',
              type: 'integer',
              description: 'An issue ID'}],
            [{name: 'issues',
              type: 'array',
              description: 'A list of notes'}]
        );
    }


    exports.init = init;
}());
