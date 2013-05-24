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
