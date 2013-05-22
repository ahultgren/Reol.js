"use strict";

var List = require('./List');

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
    this.index[field] = {};
    this.indexes[field] = fields[field];
  }

  return this;
}

// Expose List, just to be nice
Reol.List = List;


/* Public methods
============================================================================= */

Reol.prototype = new List();

/**
 * .add()
 *
 * Add an element. Currently only supports a special kind of unique index which
 * will only reject duplicates from the violating index, but keep the element
 * in other indexes and in the list.
 *
 * @param element (Object) Object to be indexed
 * @param [callback] (Function) Optional callback
 * @return (Reol) this
 */

Reol.prototype.add = function(element, callback) {
  var err, field;

  if(typeof element !== 'object') {
    err = new Error('Sorry, this class only works with objects.');
    if(callback) {
      callback(err);
    }
    else {
      throw err;
    }
  }

  // Add to list
  this.push(element);

  // Add to indexes
  for(field in this.indexes) {
    addToIndex.call(this, field, element);
  }

  if(callback) {
    callback();
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
 * @param [callback] (Function) Optional callback
 * @param [one] (Boolean) If true will only return one element
 * @return (Array|Object|undefined) The found elements
 */

Reol.prototype.find = function(conditions, callback, one) {
  var key, condition, result;

  callback = callback || function(){};

  // Extract property name
  for(condition in conditions) {
    if(conditions[condition]) {
      key = condition;
      break;
    }
  }

  // Return eveything
  if(!key) {
    callback(this.toArray());
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

  callback(null, result);
  return result;
};


/**
 * .findOne()
 *
 * Find exactly zero or one element. Should be a tiny bit faster than .find().
 *
 * @param conditions (Object) One (1!) condition to match. Multiple conditions will
 *  be supported later.
 * @param [callback] (Function) Optional callback
 * @return (Object|undefined) The element found if found
 */

Reol.prototype.findOne = function(conditions, callback) {
  return this.find(conditions, function (err, result) {
    if(callback) {
      callback(err, result[0]);
    }
  }, true)[0];
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
  return this.index[key][value];
};


/* Private helpers (must be .call()ed)
============================================================================= */

function addToIndex (field, element) {
  var i, l,
      parts,
      indexedValue = '';

  if(element[field]) {
    indexedValue = element[field];
  }
  else if(field.indexOf('.')) {
    indexedValue = List.findByPath(element, field);
  }

  /*jshint validthis:true */
  if(typeof this.index[field][indexedValue] !== 'object') {
    this.index[field][indexedValue] = element;
    return true;
  }

  return false;
}

module.exports = Reol;
