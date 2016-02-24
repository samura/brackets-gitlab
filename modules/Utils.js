define(function (require, exports, module) {
    "use strict";

    exports.encodeSensitiveInformation = function (str) {
        // should match passwords in http/https urls
        str = str.replace(/(https?:\/\/)([^:@\s]*):([^:@]*)?@/g, function (a, protocol, user/*, pass*/) {
            return protocol + user + ":***@";
        });
        // should match user name in windows user folders
        str = str.replace(/(users)(\\|\/)([^\\\/]+)(\\|\/)/i, function (a, users, slash1, username, slash2) {
            return users + slash1 + "***" + slash2;
        });
        return str;
    }

});
