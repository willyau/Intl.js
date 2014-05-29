/**
 * Convert only a-z to uppercase as per section 6.1 of the spec
 */
module.exports = function  (str) {
    var i = str.length;

    while (i--) {
        var ch = str.charAt(i);

        if (ch >= "a" && ch <= "z")
            str = str.slice(0, i) + ch.toUpperCase() + str.slice(i+1);
    }

    return str;
};
