const { CStructMetadata } = require("./decorators-metadata");
const { CStructPropertyOptions, Dictionary } = require("./decorators-types");
const { CStructClassOptions } = require("./decorators-types");

/**
 * CStructClass decorator
 * @param {CStructClassOptions} options - The options for the class
 * @returns {Function} - The decorator function
 */
function CStructClass(options = {}) {
    return function (target) {
        CStructMetadata.addClass(target, options);
        return target;
    };
}

/**
 * CStructProperty decorator
 * @param {CStructPropertyOptions} options - The options for the property
 * @returns {Function} - The decorator function
 */
function CStructProperty(options) {
    return function (target, propertyName) {
        CStructMetadata.addProperty(target, propertyName, options);
    }
}

module.exports = {
    CStructClass,
    CStructProperty
};