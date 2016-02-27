define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        AppInit = brackets.getModule('utils/AppInit'),

        Strings = require( 'modules/Strings' ),
        Defaults = require( 'modules/Defaults' ),
        Gitlab = require( 'modules/Gitlab' ),
        Git = require( 'modules/Git' ),
        StatusBar = require( 'modules/StatusBar' ),
        Panel = require( 'modules/Panel' ),

        // menu
        Menus = brackets.getModule("command/Menus"),
        menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU ),

        // settings
        SettingsDialog = require( 'modules/SettingsDialog' ),
        settings = PreferencesManager.getExtensionPrefs( 'samura.bracketsGitlab' ),

        // strings
        COMMAND_ID_SETTINGS = 'samura.brackets-gitlab.settings'
    ;

    // Show settings dialog.
    function _showSettingsDialog() {
        SettingsDialog.show( settings );
    }

    AppInit.appReady(function () {
        // Register extension.
        CommandManager.register( Strings.EXTENSION_NAME, COMMAND_ID_SETTINGS, _showSettingsDialog );

        // Add command to menu.
        if ( menu !== undefined ) {
            menu.addMenuDivider();
            menu.addMenuItem( COMMAND_ID_SETTINGS );
            menu.addMenuDivider();
        }

        ExtensionUtils.loadStyleSheet(module, 'styles/style.css');

        // load defaults
        Defaults.init( settings );

        // start gitlab
        Gitlab.init( settings );
        Git.init( settings );

        StatusBar.init( settings );
        Panel.init( settings );
    });
});
