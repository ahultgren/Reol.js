(function(name, definition) {
  /* jshint strict:false */
  // Just stuff to make this module work in commonJS and AMD as well as plain browser environments
  if (typeof module !== 'undefined') { module.exports = definition(); }
  else if (typeof define === 'function' && typeof define.amd === 'object') { define(definition); }
  else { this[name] = definition(); }
}('Reol', function() {
  "use strict";

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
    this.indexes = {};

    // Define indexes
    for(field in fields) {
      this.index[field] = {};
      this.indexes[field] = fields[field];
    }

    return this;
  }

  Reol.prototype = [];


  /* Static methods
  ============================================================================= */
  
  Reol.stringify = function (value) {
    var newValue = '', field;

    //## Should undefined and null be converted to empty strings?..
    if(typeof value === 'object') {
      newValue = JSON.stringify(value);
    }
    else {
      newValue = value + '';
    }

    return newValue;
  };

  Reol.findByPath = function (element, path) {
    var next;

    path = path.split('.');
    next = path.shift();

    if(!next) {
      return element;
    }

    return Reol.findByPath(element[next], path.join('.'));
  };


  /* Public methods
  ============================================================================= */

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
    callback = callback || function(){};

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
      addToIndexe.call(this, field, element);
    }

    return this;
  };


  /**
   * .merge()
   *
   * Adds all elements in an Array or another instance of Reol.
   *
   * @param elements (Reol|Array) Elements to merge
   * @param [callback] (Function) Optional callback
   * @return (Object) this
   */

  Reol.prototype.merge = function(elements, callback) {
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
   * .find()
   *
   * Find all elements matching the conditions.
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
      if(conditions.hasOwnProperty(condition)) {
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
      result = this.findInIndex(key, conditions[key], one);
    }
    // Find in list
    else {
      result = this.findInList(key, conditions[key], one);
    }

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
   * Find all elements in a specified index.
   *
   * @param key (string) The name of the index/field to match
   * @param value (string) The value to match
   * @return (Array) Found elements.
   */

  Reol.prototype.findInIndex = function (key, value, one) {
    var ret = [],
        index = this.index[key][Reol.stringify(value)];

    if (typeof index == 'undefined') return ret;

    for (var i = 0, l = index.length; i < l; i++) {
      ret.push(index[i]);
      if (one) break;
    }
    return ret;
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
  
  Reol.prototype.findInList = function(key, value, one) {
    var i, l, result = [], list = this;

    for(i = 0, l = list.length; i < l; i++) {
      if(list[i].hasOwnProperty(key) && list[i][key] === value) {
        result.push(list[i]);

        if(one) {
          break;
        }
      }
    }

    return result;
  };


  /**
   * .toArray()
   *
   * Basically just returns this, but use this anyway in case of API changes
   *
   * @return (Array) Everything
   */
  
  Reol.prototype.toArray = function() {
    return this;
  };


  /* Private helpers (must be .call()ed)
  ============================================================================= */
  
  function addToIndexe (field, element) {
    var i, l,
        parts,
        indexedValue = '';

    if(element[field]) {
      indexedValue = Reol.stringify(element[field]);
    }
    else if(field.indexOf('.')) {
      indexedValue = Reol.stringify(Reol.findByPath(element, field));
    }

    /*jshint validthis:true */
    if(!this.index[field].hasOwnProperty(indexedValue)) {
      this.index[field][indexedValue] = [];
    }
    this.index[field][indexedValue].push(element);
  }
  

  return Reol;
}));
