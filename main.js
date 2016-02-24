/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** Simple extension that adds a "File > Hello World" menu item. Inserts "Hello, world!" at cursor pos. */
define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),

        Strings = require( 'modules/Strings' ),
        Gitlab = require( 'modules/Gitlab' ),
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

    // Register extension.
    CommandManager.register( Strings.EXTENSION_NAME, COMMAND_ID_SETTINGS, showSettingsDialog );

    // Add command to menu.
    if ( menu !== undefined ) {
        menu.addMenuDivider();
        menu.addMenuItem( COMMAND_ID_SETTINGS );
        menu.addMenuDivider();
    }

    // Show settings dialog.
    function showSettingsDialog() {
        SettingsDialog.show( settings );
    }

    ExtensionUtils.loadStyleSheet(module, 'styles/style.css');

    // start gitlab
    Gitlab.init( settings );

    StatusBar.init( settings );
    Panel.init();
});
