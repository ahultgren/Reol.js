"use strict";

var utils = require('./utils'),
    List;

/**
 * List
 *
 * "Class" inherited by all other array-like objects to provide some common
 * methods.
 */

exports = module.exports = List = function (options) {
  utils.extend(this, options);  
};


/* Static methods
============================================================================= */

// Find a property by path, eg "level1.level2"
List.findByPath = function (element, path) {
  var next, _element;
  
  path = path.split('.');
  _element = element;
  
  while(path.length && _element) {
    next = path.shift();
    _element = _element[next];
  }
  
  return _element;
};


/* Public methods
============================================================================= */

List.prototype = [];

/**
 * .add(Object)
 *
 * Basic add. Most subclasses will overwrite it
 */

List.prototype.add = function(element) {
  this.push(element);
};


/**
 * .merge()
 *
 * Adds all elements in an Array or another instance of List.
 *
 * @param elements (List|Array) Elements to merge
 * @param [callback] (Function) Optional callback
 * @return (Object) this
 */

List.prototype.merge = function(elements, callback) {
  var i, l;

  for(i = 0, l = elements.length; i < l; i++) {
    this.add(elements[i]);
  }

  if(callback) {
    callback();
  }

  return this;
};


/**
 * .findInList()
 *
 * Justa naive search through all elements until a match is found
 *
 * @param key (string) The name of the index/field to match
 * @param value (string) The value to match
 * @param [one] (string) If true will return on first match
 * @return (Array) Found elements.
 */

List.prototype.findInList = function(key, value, one) {
  var i, l, result = [], list = this;

  for(i = 0, l = list.length; i < l; i++) {
    if(list[i][key] === value) {
      if(one) {
        return list[i];
      }

      result.push(list[i]);
    }
  }

  return result;
};


/**
 * .toArray()
 *
 * Returning a copy of this as an array.
 *
 * @return (Array) Everything
 */

List.prototype.toArray = function() {
  return [].slice.call(this);
};
