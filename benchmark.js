var Reol = require('./'),
    bnch = require('bnch');

var list = new Reol({
        test1: true,
        test2: true
    }),
    array = [];

for(var i = 100000; i--;) {
    var obj = {
        test1: 'meow' + i,
        test2: 'mooo' + i,
        test3: 'mooo' + i,
        test4: 'mooo' + i,
        test5: 'mooo' + i,
        test6: 'mooo' + i,
        test7: 'mooo' + i,
        test8: 'mooo' + i,
        test9: 'mooo' + i
    };
    list.add(obj);
    array.push(obj);
}

function find(key, value) {
    for(var i = 0, l = array.length; i < l; i++) {
        if(array[i][key] === value) {
            return array[i];
        }
    }
}

var suite = bnch();

suite.add('naive find', function() {
    find('test1', 'meow1');
    find('test2', 'mooo50000');
    find('test1', 'meow99999');
});

suite.add('.find()', function() {
    list.find({ test1:  'meow1' });
    list.find({ test2:  'mooo50000' });
    list.find({ test1:  'meow99999' });
});

suite.add('.findInIndex()', function() {
    list.findInIndex('test1', 'meow1');
    list.findInIndex('test2', 'mooo50000');
    list.findInIndex('test1', 'meow99999');
});

suite.add('.findInList()', function() {
    list.findInList('test1', 'meow1', true);
    list.findInList('test2', 'mooo50000', true);
    list.findInList('test1', 'meow99999', true);
});

