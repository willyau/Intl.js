var hop = Object.prototype.hasOwnProperty,
    realDefineProp = (function () {
        try { return !!Object.defineProperty({}, 'a', {}); }
        catch (e) { return false; }
    })();

module.exports = realDefineProp ? Object.defineProperty : function (obj, name, desc) {
    if ('get' in desc && obj.__defineGetter__)
        obj.__defineGetter__(name, desc.get);

    else if (!hop.call(obj, name) || 'value' in desc)
        obj[name] = desc.value;
};

// Additionally expose a property for other modules to identify when accessors aren't supported
module.exports.noAccessors = !realDefineProp && !Object.prototype.__defineGetter__;
