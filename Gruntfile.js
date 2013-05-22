/*global module:false*/
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        globalstrict: true,
        node: true
      },
      lib: {
        files: {
          src: ['Gruntfile.js', 'index.js', 'package.json']
        }
      },
      test: {
        options: {
          globals: {
            describe: true,
            it: true,
            after: true
          },
          files: {
            src: ['test/*.js']
          }
        }
      }
    },
    browserify: {
      'dist/reol.js': 'index.js'
    },
    uglify: {
      browser: {
        files: {
          'dist/reol.min.js': ['dist/reol.js']
        }
      }
    }
  });

  // npm tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'browserify', 'uglify']);
};
