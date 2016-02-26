define( function (require, exports) {
    'use strict';

    exports.init = function (prefs) {
        prefs.definePreference("dataUpdateTime", "int", 30);
        prefs.definePreference("stageAll", "boolean", true);
    };
} );
