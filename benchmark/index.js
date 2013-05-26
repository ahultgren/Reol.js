"use strict";

var Reol = require('../.'),
    Benchmark = require('Benchmark'),
    async = require('async'),
    bigSuite = new Benchmark.Suite(),
    smallSuite = new Benchmark.Suite(),
    writeSuite = new Benchmark.Suite(),
    bigList, bigArray,
    smallList, smallArray,
    writeList, writeArray, wi;


/* Preparation
============================================================================= */

function makeList (list, array, max) {
  for(var i = max; i--;) {
    list.add({
      test1: 'meow' + i,
      test2: 'mooo' + i,
      test3: 'mooo' + i,
      test4: 'mooo' + i,
      test5: 'mooo' + i,
      test6: 'mooo' + i,
      test7: 'mooo' + i,
      test8: 'mooo' + i,
      test9: 'mooo' + i
    });

    array.push({
      test1: 'meow' + i,
      test2: 'mooo' + i,
      test3: 'mooo' + i,
      test4: 'mooo' + i,
      test5: 'mooo' + i,
      test6: 'mooo' + i,
      test7: 'mooo' + i,
      test8: 'mooo' + i,
      test9: 'mooo' + i
    });
  }
}

// Big
bigList = new Reol({
  test1: true,
  test2: true
});
bigArray = [];

// Small
smallList = new Reol({
  test1: true,
  test2: true
});
smallArray = [];

makeList(bigList, bigArray, 1000);
makeList(smallList, smallArray, 10);

// Write
writeList = new Reol({
  test1: true,
  test2: true
});
writeArray = [];
wi = 0;


/* Comparision method
============================================================================= */

function find(array, key, value) {
  for(var i = 0, l = array.length; i < l; i++) {
    if(array[i][key] === value) {
      return array[i];
    }
  }
}


/* Tests
============================================================================= */

// Big

bigSuite.add('.find()', function () {
  bigList.find({ test1:  'meow1' });
  bigList.find({ test2:  'mooo500' });
  bigList.find({ test1:  'meow999' });
});

bigSuite.add('.findInIndex()', function () {
  bigList.findInIndex('test1', 'meow1');
  bigList.findInIndex('test2', 'mooo500');
  bigList.findInIndex('test1', 'meow999');
});

bigSuite.add('.findInList()', function () {
  bigList.findInList('test1', 'meow1', true);
  bigList.findInList('test2', 'mooo500', true);
  bigList.findInList('test1', 'meow999', true);
});

bigSuite.add('Naive find', function () {
  find(bigArray, 'test1', 'meow1');
  find(bigArray, 'test2', 'mooo500');
  find(bigArray, 'test1', 'meow999');
});


// Small

smallSuite.add('.find()', function () {
  smallList.find({ test1:  'meow1' });
  smallList.find({ test2:  'mooo5' });
  smallList.find({ test1:  'meow9' });
});

smallSuite.add('.findInIndex()', function () {
  smallList.findInIndex('test1', 'meow1');
  smallList.findInIndex('test2', 'mooo5');
  smallList.findInIndex('test1', 'meow9');
});

smallSuite.add('.findInList()', function () {
  smallList.findInList('test1', 'meow1', true);
  smallList.findInList('test2', 'mooo5', true);
  smallList.findInList('test1', 'meow9', true);
});

smallSuite.add('Naive find', function () {
  find(smallArray, 'test1', 'meow1');
  find(smallArray, 'test2', 'mooo5');
  find(smallArray, 'test1', 'meow9');
});


// Write
writeSuite.add('.add()', function () {
  writeList.add({
    test1: 'meow' + (wi++),
    test2: 'mooo' + (wi++),
    test3: 'mooo' + (wi++)
  });
});

writeSuite.add('.push()', function () {
  writeArray.push({
    test1: 'meow' + (wi++),
    test2: 'mooo' + (wi++),
    test3: 'mooo' + (wi++)
  });
});


/* Stuff
============================================================================= */

async.series([
function (next) {
  bigSuite.on('start', function(event) {
    console.log('Big benchmark started (l: ' + bigArray.length + ')');
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function (argument) {
    console.log('Big benchmark done');
    next();
  })
  .run({ async: true });
},
function (next) {
  smallSuite.on('start', function(event) {
    console.log('Small benchmark started (l: ' + smallArray.length + ')');
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function (argument) {
    console.log('Small benchmark done');
    next();
  })
  .run({ async: true });
},
function (next) {
  writeSuite.on('start', function(event) {
    console.log('Write benchmark started');
  })
  .on('cycle', function(event) {
    console.log(String(event.target));

    // Clear lists
    writeList = new Reol({
      test1: true,
      test2: true
    });
    writeArray = [];
    wi = 0;
  })
  .on('complete', function (argument) {
    console.log('Write benchmark done');
    next();
  })
  .run({ async: true });
}],
function () {
  console.log('All benchmarks done');
});
