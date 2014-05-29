var hop = Object.prototype.hasOwnProperty,
    defineProperty = require('./defineProperty');

module.exports = Object.create || function (proto, props) {
    var obj;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (var k in props) {
        if (hop.call(props, k))
            defineProperty(obj, k, props[k]);
    }

    return obj;
};
