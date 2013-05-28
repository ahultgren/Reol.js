"use strict";

var List = require('./List'),
    Index = require('./Index');

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

  List.call(this);

  this.index = {};
  this.indexes = {};

  // Define indexes
  for(field in fields) {
    this.index[field] = new Index(field, fields[field]);
    this.indexes[field] = fields[field];
  }

  return this;
}

// Expose List, just to be nice
Reol.List = List;


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
  for(field in this.indexes) {
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
    return this.toArray();
  }

  // Find in index
  if(this.index[key]) {
    result = this.findInIndex(key, conditions[key]);
  }
  // Find in list
  else {
    result = this.findInList(key, conditions[key], one);
  }

  result = !result && [] || result.length !== undefined && result || [result];

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


module.exports = Reol;
