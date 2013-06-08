"use strict";

var List;

/**
 * List
 *
 * "Class" inherited by all other array-like objects to provide some common
 * methods.
 */

exports = module.exports = List = function List (options, defaults) {
  this.options = {};
  List.extend(this.options, defaults, options);
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

// Shallow copy of objects
List.extend = function (target) {
  var sources = [].slice.call(arguments, 1),
      source, prop;

  while(sources.length > 0) {
    source = sources.shift();

    for(prop in source) {
      if(source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  }

  return target;
};


/* Public methods
============================================================================= */

List.prototype = [];
List.prototype.constructor = List;

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
  var i, l, result = new List({ source: this.options.source }), list = this;

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
 * .clone()
 *
 * Make a clone of the object, preserving the instance's settings but dropping
 * relations to any source.
 *
 * @return (List) The new instance
 */

List.prototype.clone = function() {
  var result = new this.constructor(this.options);

  delete result.options.source;
  result.merge(this);

  return result;
};


/**
 * .remove()
 *
 * Remove elements from the list. If the list has a source the remove command
 * will be called on the source, and remove will be called
 * on that list with the supplied element as argument. If no element is supplied
 * all elements in the list will be removed. Use .clone() to not remove elements
 * from the source.
 *
 * @param [elements] (Object) Element(s) to remove
 * @return (Object) The same list it was called on
 */

List.prototype.remove = function(elements, _fromParent) {
  var i, elementIndex;

  elements = elements || this.clone();

  if(!_fromParent && this.options.source) {
    this.options.source.remove(elements);
  }

  if(elements === this) {
    // Just remove everything
    [].splice.call(this, 0);
  }
  else {
    // Loop through the hard way
    for(i = elements.length; i--;) {
      elementIndex = this.indexOf(elements[i]);

      if(this[elementIndex]) {
        [].splice.call(this, elementIndex, 1);
      }
    }
  }

  return this;
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
  var result = new List({ source: this.options.source }),
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
  return this.merge(arguments);
};

List.prototype.unshift = function() {
  var i, element;

  // Add each element to the beginning, backwards
  for(i = arguments.length; i--;) {
    element = arguments[i];
    this.add(element, 0);
  }

  return this;
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

List.prototype.pop = function() {
  var result = this[this.length - 1];

  this.remove([result]);
  return result;
};

List.prototype.shift = function() {
  var result = this[0];

  this.remove([result]);
  return result;
};

List.prototype.splice = function(index, howMany, replace) {
  var result = new List(),
      length = arguments.length,
      i;

  // Prepare replacements
  replace = replace ? [replace] : [];

  if(length > 3) {
    replace = Array.prototype.slice.call(arguments, 2);
  }

  // Get elements
  result.merge(Array.prototype.slice.call(this, index, index + howMany));

  // Remove elements
  this.remove(result);

  // Add replacements one at a time, backwards
  for(i = replace.length; i--;) {
    this.add(replace[i], index);
  }

  return result;
};
