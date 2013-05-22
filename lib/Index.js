"use strict";

var List = require('./List'),
    extend = require('./utils').extend,
    Index;


Index = exports = module.exports = function (index, options) {
  this._index = index;
  this._settings = extend({
    unique: false,
    sparse: false
  }, typeof options === 'object' && object || {});

  return this;
};

Index.prototype = new List();

Index.prototype.add = function(element) {
  var i, l,
      index = this._index,
      value = undefined;

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

  // If unique (let's support non-uniqueness soon)
  if(typeof this[value] === 'object') {
    return false;
  }

  this[value] = element;
  return true;
};

Index.prototype.find = function(value) {
  return this[value];
};
