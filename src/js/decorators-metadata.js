const { Model, Types } = require("./types");
const { CStructBE } = require("./cstruct-be");
const { CStructLE } = require("./cstruct-le");
const { Constructor, CStructClassOptions, CStructPropertyOptions, Dictionary } = require("./decorators-types");

/**
 * CStructMetadata class
 * @class
 */
class CStructMetadata {
    /**
     * CStructMetadata constructor
     */
    constructor() {
        this.model = {};
        this.types = {};
        this.cStruct = null;
        this.class = null;
        this.className = null;
        this.CStructSymbol = Symbol('CStruct');
    }

    /**
     * Get metadata from a target
     * @param {any} target - The target to get metadata from
     * @returns {any} - The metadata
     */
    static getMetadata(target) {
        const constructorMetadata = target.constructor?.[this.CStructSymbol];
        const prototypeMetadata = target.prototype?.[this.CStructSymbol];
        const targetMetadata = target[this.CStructSymbol];
        let metadata = constructorMetadata ?? prototypeMetadata ?? targetMetadata;
        if (!metadata) {
            metadata = target[this.CStructSymbol] = new CStructMetadata();
            if ('model' in target) {
                metadata.model = target.model;
                metadata.types = target.types;
            }
        }
        return metadata;
    }

    /**
     * Add a property to a target
     * @param {T & Dictionary} target - The target to add a property to
     * @param {string} propertyName - The name of the property to add
     * @param {CStructPropertyOptions} options - The options for the property
     */
    static addProperty(target, propertyName, options) {
        const metadata = CStructMetadata.getMetadata(target);
        metadata.model[propertyName] = options.type;
    }

    /**
     * Add a class to a target
     * @param {T & Dictionary} target - The target to add a class to
     * @param {CStructClassOptions} options - The options for the class
     */
    static addClass(target, options) {
        const metadata = CStructMetadata.getMetadata(target);
        metadata.types = options.types;
        metadata.model = options.model ?? metadata.model;
        metadata.class = target;
        metadata.className = target.name;
    }

    /**
     * Get a CStructBE from a struct
     * @param {T} struct - The struct to get a CStructBE from
     * @returns {CStructBE<T>} - The CStructBE
     */
    static getCStructBE(struct) {
        const metadata = CStructMetadata.getMetadata(struct);
        if (!metadata.cStruct) {
            if (!metadata.model) {
                throw Error(`Provided struct is not decorated.`);
            }
            metadata.cStruct = CStructBE.fromModelTypes(metadata.model, metadata.types);
        }
        return metadata.cStruct;
    }

    /**
     * Get a CStructLE from a struct
     * @param {T} struct - The struct to get a CStructLE from
     * @returns {CStructLE<T>} - The CStructLE
     */
    static getCStructLE(struct) {
        const metadata = CStructMetadata.getMetadata(struct);
        if (!metadata.cStruct) {
            if (!metadata.model) {
                throw Error(`Provided struct is not decorated.`);
            }
            metadata.cStruct = CStructLE.fromModelTypes(metadata.model, metadata.types);
        }
        return metadata.cStruct;
    }

    /**
     * Get a model from a struct
     * @param {T} struct - The struct to get a model from
     * @returns {Model} - The model
     */
    static getModel(struct) {
        const metadata = CStructMetadata.getMetadata(struct);
        return metadata.model;
    }

    /**
     * Get types from a struct
     * @param {T} struct - The struct to get types from
     * @returns {Types} - The types
     */
    static getTypes(struct) {
        const metadata = CStructMetadata.getMetadata(struct);
        return metadata.types;
    }
}

module.exports = CStructMetadata;