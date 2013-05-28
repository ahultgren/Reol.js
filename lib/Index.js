"use strict";

var List = require('./List'),
    Bucket = require('./Bucket'),
    Index;


/**
 * Index
 *
 * Class for storing objects in a hash where the property is a certain key of
 * each object. 
 *
 * @param index (String) Property to index
 * @param [options] (Object) Property to index
 *  @param unique (Boolean) If true, elements will be added only if the indexed
 *    property has not been indexed already
 *  @param sparse (Boolean) If true, undefined values will not be added (note
 *    that other falsey values are not considered undefined)
 * @return (Object) this
 */

Index = exports = module.exports = function (index, options) {
  this.elements = {};
  this.index = index;

  options = options || {};
  this.unique = options.unique || false;
  this.sparse = options.sparse || false;

  return this;
};


/* Public methods
============================================================================= */

Index.prototype.add = function(element) {
  var i, l,
      elements = this.elements,
      index = this.index,
      value,
      bucket;

  // Extract indexable value
  if(index.indexOf('.')) {
    value = List.findByPath(element, index);
  }
  else if(element[index] !== undefined) {
    value = element[index];
  }

  // If sparse and undefined
  if(value === undefined && this.sparse === true) {
    return false;
  }

  bucket = elements[value];

  if(!bucket) {
    elements[value] = bucket = new Bucket(this.unique);
  }

  bucket.add(element);

  return true;
};


Index.prototype.find = function(value) {
  return this.elements[value];
};
