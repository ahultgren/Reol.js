"use strict";

var utils = require('./utils'),
    List;

/**
 * List
 *
 * "Class" inherited by all other array-like objects to provide some common
 * methods.
 */

exports = module.exports = List = function (options, defaults) {
  utils.extend(this, defaults, options);  
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

List.prototype.add = function(element, _where) {
  _where = Number(_where);

  if(isNaN(_where)) {
    Array.prototype.push.call(this, element);
  }
  else {
    Array.prototype.splice.call(this, _where, 0, element);
  }
};


/**
 * .merge()
 *
 * Adds all elements in an Array or another instance of List.
 *
 * @param elements (List|Array) Elements to merge
 * @return (Object) this
 */

List.prototype.merge = function(elements) {
  var i, l;

  for(i = 0, l = elements.length; i < l; i++) {
    this.add(elements[i]);
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


/**
 * .filter()
 *
 * Returns a new List of elements matching the conditions
 *
 * @param conditions (Object|Function) The conditions to match or comparing method
 * @return (List) The matched set
 */

List.prototype.filter = function(conditions) {
  var result = new List(),
      matcher = typeof conditions === 'function' ? conditions : match(conditions),
      i, l;

  if(Array.prototype.filter) {
    return result.merge([].filter.call(this, matcher));
  }

  // Custom filter implementation
  for(i = 0, l = this.length; i < l; i++) {
    if(match(this[i])) {
      result.add(this[i]);
    }
  }

  return result;
};


/**
 * .map()
 *
 * Regular Array.map() method whith the added ability to specify a property to
 * auto map.
 *
 * @param property (String) Name
 * @return (type) Description
 */

List.prototype.map = function(property) {
  var result = new List(),
      extractor = typeof property === 'function' ? property : extract(property),
      i, l;

  for(i = 0, l = this.length; i < l; i++) {
    result.add(extractor(this[i]));
  }

  return result;
};


/* Private functions
============================================================================= */


/**
 * match()
 *
 * Whether or not an element matches some conditions
 *
 * @param conditions (Object) Conditions
 * @return (Function)
 *  @param element (Object) Element to be matched
 *  @return (Boolean) Match or not
 */

function match (conditions) {
  return function (element) {
    var i;

    for(i in conditions) {
      if(List.findByPath(element, i) !== conditions[i]) {
        return false;
      }
    }

    return true;
  };
}


/**
 * extract()
 *
 * Return the property of an element
 *
 * @param paramName (type) Description
 * @return (type) Description
 */

function extract (property) {
  return function (element) {
    return List.findByPath(element, property);
  };
}


/* Aliases for imitating an array
============================================================================= */

List.prototype.push = function() {
  this.merge(arguments);
};

List.prototype.unshift = function() {
  var i, element;

  // Add each element to the beginning, backwards
  for(i = arguments.length; i--;) {
    element = arguments[i];
    this.add(element, 0);
  }
};

List.prototype.concat = function() {
  var result = new List(),
      src = arguments,
      i, l;

  result.merge(this);

  for(i = 0, l = src.length; i < l; i++) {
    result.merge(src[i]);
  }

  return result;
};
