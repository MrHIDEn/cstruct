// 'c_struct' - written by Marek Krzyzowski 29.09.2019 0.8.0
'use strict';

const lib = require('./lib/c_struct');

/**
 * 
 * @param {Object|Array|String|JSON} base 
 * @param {Object|Array|String|JSON} types 
 * @param {Number} preAllocSize 
 * 
 * @returns {C_struct}
 */
function struct(base, types, preAllocSize = 200) {
    return new lib.C_Struct(base, types, preAllocSize);
}
module.exports.struct = struct;
