require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"Reol":[function(require,module,exports){
module.exports=require('oF0Uok');
},{}],"oF0Uok":[function(require,module,exports){
(function(){"use strict";
module.exports = require('./lib/Reol');
/*jshint expr:true*/
/*global window:true*/
typeof window !== 'undefined' && (window.Reol = module.exports);

})()
},{"./lib/Reol":1}],1:[function(require,module,exports){
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
    this.index[field].add(element);
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
  return this.index[key].find(value);
};


module.exports = Reol;

},{"./List":2,"./Index":3}],2:[function(require,module,exports){
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


/**
 * .filter()
 *
 * Returns a new List of elements matching the conditions
 *
 * @param paramName (type) Description
 * @return (type) Description
 */

List.prototype.filter = function(conditions) {
  var result = new this.constructor(),
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
},{"./utils":4}],3:[function(require,module,exports){
"use strict";

var List = require('./List'),
    Bucket = require('./Bucket'),
    extend = require('./utils').extend,
    Index;


Index = exports = module.exports = function (index, options) {
  this._index = index;
  this._settings = extend({
    unique: false,
    sparse: false
  }, typeof options === 'object' && options || {});

  return this;
};

Index.prototype = new List();
Index.prototype.constructor = Index;

Index.prototype.add = function(element) {
  var i, l,
      index = this._index,
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
  if(value === undefined && this._settings.sparse === true) {
    return false;
  }

  bucket = this[value];

  if(!bucket) {
    this[value] = bucket = new Bucket(this._settings.unique);
  }

  bucket.add(element);

  return true;
};

Index.prototype.find = function(value) {
  return this[value];
};

},{"./List":2,"./Bucket":5,"./utils":4}],4:[function(require,module,exports){
"use strict";

/**
 * utils
 *
 * Just some handy helpers
 */

exports.extend = function (target) {
  var sources = [].slice.call(arguments),
      source, prop;

  while(!!(source = sources.shift())) {
    for(prop in source) {
      target[prop] = source[prop];
    }
  }

  return target;
};

},{}],5:[function(require,module,exports){
"use strict";

var List = require('./List'),
    Bucket;

/**
 * Bucket
 *
 * Pretty much a List which knows if it's unique or not
 */


Bucket = exports = module.exports = function (unique) {
  this.unique = unique;
};

Bucket.prototype = new List();
Bucket.prototype.constructor = Bucket;

Bucket.prototype.add = function(element) {
  if(!this.length || !this.unique) {
    this.push(element);
  }
};

},{"./List":2}]},{},["oF0Uok"])
;