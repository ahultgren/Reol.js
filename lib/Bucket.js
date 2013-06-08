"use strict";

var List = require('./List'),
    Bucket;

/**
 * Bucket
 *
 * Pretty much a List which knows if it's unique or not
 */


Bucket = exports = module.exports = function Bucket (options) {
  List.call(this, options, {
    unique: false
  });
};

Bucket.prototype = new List();
Bucket.prototype.constructor = Bucket;

Bucket.prototype.add = function(element, _where) {
  if(!this.length || !this.options.unique) {
    List.prototype.add.call(this, element, _where);
  }
};
