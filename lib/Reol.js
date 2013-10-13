"use strict";

var List = require('./List'),
    Index = require('./Index'),
    Bucket = require('./Bucket'),
    extend = List.extend;

/**
 * Reol
 *
 * An array with multiple user-specified indexes. Slower to write, faster to read.
 * Made for the cases where you initialize a huge array of objects and frequently
 * whish to find those with a specific property and value.
 *
 * @param fields (object) List of fields you whish to index
 * @return (Object) this
 */

function Reol (fields) {
  var field;

  this.index = {};
  this.fields = fields;

  // Define indexes
  for(field in fields) {
    if(typeof fields[field] !== 'object') {
      fields[field] = {};
    }

    this.index[field] = new Index(extend(fields[field], { index: field, source: this }));
  }

  return this;
}

// Expose helper classes, just to be nice
Reol.List = List;
Reol.Bucket = Bucket;
Reol.Index = Index;


/* Public methods
============================================================================= */

Reol.prototype = new List();
Reol.prototype.constructor = Reol;

/**
 * .add()
 *
 * Add an element. Currently only supports a special kind of unique index which
 * will only reject duplicates from the violating index, but keep the element
 * in other indexes and in the list.
 *
 * @param element (Object) Object to be indexed
 * @return (Reol) this
 */

Reol.prototype.add = function(element, _where) {
  var err, field;

  if(typeof element !== 'object') {
    throw new Error('Sorry, this class only works with objects.');
  }

  // Add to list
  List.prototype.add.call(this, element, _where);

  // Add to indexes
  for(field in this.index) {
    this.index[field].add(element);
  }

  return this;
};


/**
 * .find()
 *
 * Find all elements matching the conditions.
 * an array with one element.
 *
 * @param conditions (object) One (1!) condition to match. Multiple conditions will
 *  be supported later.
 * @param [one] (Boolean) If true will only return one element
 * @return (Array|Object|undefined) The found elements
 */

Reol.prototype.find = function(conditions, one) {
  var key, condition, result;

  // Extract property name
  for(condition in conditions) {
    if(conditions[condition]) {
      key = condition;
      break;
    }
  }

  // Return eveything
  if(!key) {
    return this;
  }

  // Find in index
  if(this.index[key]) {
    result = this.findInIndex(key, conditions[key]);
  }
  // Find in list
  else {
    result = this.findInList(key, conditions[key], one);
  }

  return result;
};


/**
 * .findOne()
 *
 * Find exactly zero or one element. Should be a tiny bit faster than .find().
 *
 * @param conditions (Object) One (1!) condition to match. Multiple conditions will
 *  be supported later.
 * @return (Object|undefined) The element found if found
 */

Reol.prototype.findOne = function(conditions) {
  return this.find(conditions, true)[0];
};


/**
 * .findInIndex()
 *
 * Find an element in a specified index. Use this without being sure that the
 * index exists and the sky will fall on your head.
 *
 * @param key (string) The name of the index/field to match
 * @param value (string) The value to match
 * @return (Array) Found elements.
 */

Reol.prototype.findInIndex = function (key, value) {
  return this.index[key].find(value);
};


/**
 * .clone()
 *
 * Modification of List.clone() since Reol is a bit special. Creates a new instance
 *
 * @return (Reol) The new instance
 */

Reol.prototype.clone = function() {
  var result = new this.constructor(this.fields);
  result.merge(this);
  return result;
};


/**
 * .remove()
 *
 * Extends List.remove() to propagate to indexes
 */

Reol.prototype.remove = function(elements) {
  var i;

  elements = elements || this.clone();

  List.prototype.remove.call(this, elements, true);

  for(i in this.index) {
    this.index[i].remove(elements, true);
  }
};


module.exports = Reol;
