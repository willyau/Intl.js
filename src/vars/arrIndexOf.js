// Array.prototype.indexOf compatibility implementation, as good as we need it to be
module.exports = Array.prototype.indexOf || function (search) {
    /*jshint validthis:true */
    var t = this;
    if (!t.length)
        return -1;

    for (var i = arguments[1] || 0, max = t.length; i < max; i++) {
        if (t[i] === search)
            return i;
    }

    return -1;
};
