var Reol = require('../.'),
    Benchmark = require('Benchmark'),
    suite = new Benchmark.Suite(),
    list;


/* Preparation
============================================================================= */

list = new Reol({
  test1: true,
  test2: true
});

for(var i = 1000; i--;) {
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
}


/* Tests
============================================================================= */

suite.add('find', function () {
  list.find({ test1:  'meow1' });
  list.find({ test2:  'mooo500' });
  list.find({ test1:  'meow999' });
});

suite.add('findInIndex', function () {
  list.findInIndex('test1', 'meow1');
  list.findInIndex('test2', 'mooo500');
  list.findInIndex('test1', 'meow999');
});

suite.add('findInList', function () {
  list.findInList('test1', 'meow1', true);
  list.findInList('test2', 'mooo500', true);
  list.findInList('test1', 'meow999', true);
});


/* Stuff
============================================================================= */

suite.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function (argument) {
  console.log('done');
});

suite.run({ async: true });
