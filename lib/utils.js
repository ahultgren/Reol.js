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
      if(source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  }

  return target;
};
