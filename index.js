function _isTruthy(value) {
    return !!value || value === 0;
}
function _isOptional(type) {
    var _type;
    if (Array.isArray(type)) {
        _type = type[0];
    }
    else {
        _type = type;
    }
    return _type[_type.length - 1] === '?';
}
function isDate(value) {
    var date = new Date(value);
    return date.getTime() === date.getTime();
}
function isEnum(value, config) {
    return config.indexOf(value) > -1;
}
function isOr(value, config) {
    return config.findIndex(function (type) {
        return check(value, type);
    }) > -1;
}
function isArray(values, type) {
    return Array.isArray(values) && values.findIndex(function (value) {
        return !check(value, type);
    }) === -1;
}
function isArrayShape(values, type) {
    var requiredLength = type.map(function (t) { return !_isOptional(t); }).reduce(function (sum, curr) { return sum + Number(curr); }, 0);
    return Array.isArray(values) && values.length >= requiredLength && values.length <= type.length && values.findIndex(function (value, i) {
        return !check(value, type[i]);
    }) === -1;
}
function isShape(value, config) {
    if (_isTruthy(value)) {
        var keys = Object.keys(config);
        return keys.findIndex(function (key) {
            return !check(value[key], config[key]);
        }) === -1;
    }
    else {
        return false;
    }
}
function isExact(value, config) {
    if (_isTruthy(value)) {
        var cKeys_1 = Object.keys(config);
        var vKeys_1 = Object.keys(value);
        var noextra = vKeys_1.map(function (vkey) {
            return cKeys_1.indexOf(vkey) > -1;
        }).findIndex(function (key) { return key === false; }) === -1;
        var nomissing = cKeys_1.map(function (ckey) {
            return _isOptional(config[ckey]) ? true : vKeys_1.indexOf(ckey) > -1;
        }).findIndex(function (key) { return key === false; }) === -1;
        return noextra && nomissing && isShape(value, config);
    }
    else {
        return false;
    }
}
function optional(value, type, config) {
    return value === undefined || value === null
        ? true
        : required(value, type, config);
}
function required(value, type, config) {
    if (config !== null) {
        switch (type) {
            case 'exact':
                return isExact(value, config);
            case 'object':
                return isShape(value, config);
            case 'array':
                return isArray(value, config);
            case 'arrayshape':
                return isArrayShape(value, config);
            case 'enum':
                return isEnum(value, config);
            case 'or':
                return isOr(value, config);
            default:
                throw new Error("Non existent configurable types \"" + type + "\"!");
        }
    }
    else {
        switch (type) {
            case 'date':
                return isDate(value);
            case 'number':
                return typeof value === type && !isNaN(value);
            default:
                return typeof value === type;
        }
    }
}
export function check(value, type) {
    var _type;
    var _config;
    if (Array.isArray(type)) {
        _type = type[0];
        _config = type[1];
    }
    else {
        _type = type;
        _config = null;
    }
    var len = _type.length - 1;
    var isOptional = _type[len] === '?';
    if (isOptional) {
        return optional(value, _type.substr(0, len), _config);
    }
    else {
        return required(value, _type, _config);
    }
}
