define( function( require, exports ) {
    'use strict';

    // Get module dependencies.
    var Dialogs = brackets.getModule( 'widgets/Dialogs' ),

        // Extension Modules.
        Strings = require( 'modules/Strings' ),

        // Templates.
        settingsDialogTemplate = require( 'text!html/settings-dialog.html' ),


        // Variables.
        dialog,
        $dialog,
        preferences;

    /**
	 * Retrieve all values from settings dialog.
	 */
    function getValues() {
        var values = {
            apiUrl: getValue( 'apiUrl' ),
            privateKey: getValue( 'privateKey' ),
            dataUpdateTime: getValue( 'dataUpdateTime' ),
            stageAll: $dialog.find( '#stageAll' ).prop( 'checked' )
        };

        return values;
    }

    /**
	 * Get value for inputs
	 */
    function getValue( name ) {
        // Return values of checked checkboxes.
        return $( '#'+name, $dialog ).val();
    }

    /**
	 * Set values
	 */
    function setValues( values ) {
        setValue( 'apiUrl', values.apiUrl );
        setValue( 'privateKey', values.privateKey );
        setValue( 'dataUpdateTime', values.dataUpdateTime );
        $dialog.find( '#stageAll' ).prop( 'checked', values.stageAll );
    }

    /**
	 * Set value
	 */
    function setValue( name, value ) {
        // Walk through each checkbox in dialog with supplied name.
        $( '#'+name, $dialog ).val(value);
    }

    /**
	 * Initialize dialog values.
	 */
    function init() {
        var values = {
            apiUrl: preferences.get( 'apiUrl' ),
            privateKey: preferences.get( 'privateKey' ),
            dataUpdateTime: preferences.get( 'dataUpdateTime'),
            stageAll: preferences.get( 'stageAll')
        };

        setValues( values );
    }

    /**
	 * Exposed method to show dialog.
	 */
    exports.show = function( prefs ) {
        // Compile dialog template.
        var compiledTemplate = Mustache.render( settingsDialogTemplate, {
            Strings: Strings
        } );

        // Save dialog to variable.
        dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate );
        $dialog = dialog.getElement();
        preferences = prefs;

        // Initialize dialog values.
        init();

        // Open dialog.
        dialog.done( function( buttonId ) {
            var values;

            // Save preferences if OK button was clicked.
            if ( buttonId === 'ok' ) {
                values = getValues();

                console.log(values);

                preferences.set( 'apiUrl', values.apiUrl );
                preferences.set( 'privateKey', values.privateKey );
                preferences.set( 'dataUpdateTime', values.dataUpdateTime );
                preferences.set( 'stageAll', values.stageAll );
                preferences.save();
            }
        } );
    };
} );
