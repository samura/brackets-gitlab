define( function (require, exports, module) {
    'use strict';

    exports.init = function (prefs) {
        prefs.definePreference("dataUpdateTime", "int", 30);
    }
} );
