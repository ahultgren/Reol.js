"use strict";

/*global it: true, before: true, describe:true*/
/*jshint expr:true*/
var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    Reol = require('../.'),
    heap,
    testObj = {
      label1: 'test',
      unIndexedField: 'meow',
      nested: {
        child: 'AAAEEEEEEAAAIIIIOOOOUUUUUÄÄÄÄÄÄÄ!!!!!!!'
      }
    };

describe('Basic tests', function () {
  before(function () {
    heap = new Reol({
      label1: { unique: true },
      'nested.child': { sparse: true }
    });
  });

  it('Things are added', function () {
    heap.add(testObj);

    heap.toArray().length.should.equal(1);
  });

  it('Non-objects are not added', function () {
    expect(function(){
      heap.add('Throw it please');
    }).to.throw(Error);
  });

  it('Things are found', function () {
    heap.find({ label1: 'test' }).should.have.property(0).and.equal(testObj);
  });

  it('Non-exisiting things are not found', function () {
    heap.find({ label1: 'meow' }).should.be.empty;
  });

  it('Querying on non-index fields', function () {
    heap.find({ unIndexedField: 'meow' }).should.have.property(0).and.equal(testObj);
  });

  it('Deep indexing', function () {
    heap.find({ 'nested.child': testObj.nested.child }).should.have.property(0).and.equal(testObj);
  });

  it('Unique indexing', function () {
    heap.add(testObj);

    heap.index.label1.elements.test.length.should.equal(1);
    heap.index['nested.child'].elements[testObj.nested.child].length.should.equal(2);
  });

  it('Sparse indexing', function () {
    heap.add({ label1: undefined });

    heap.index.label1.elements.should.have.property(undefined);
    heap.index['nested.child'].elements.should.not.have.property(undefined);
  });

  it('Filtering with object', function () {
    var test = heap.find({ label1: testObj.label1 }).filter({ 'nested.child': testObj.nested.child });

    test.length.should.equal(1);
    test.should.have.property(0).and.equal(testObj);
  });

  it('.push()', function () {
    var before = heap.length,
        test = {
          label1: 'TEST'
        },
        test2 = {
          label1: 'TEST2'
        };

    heap.push(test, test2);

    heap.length.should.equal(before+2);
    heap.should.have.property(before).and.equal(test);
    heap.should.have.property(before+1).and.equal(test2);
  });

  it('.unshift()', function () {
    var before = heap.length,
        test = {
          label1: 'TEST'
        },
        test2 = {
          label1: 'TEST2'
        };

    heap.unshift(test, test2);

    heap.length.should.equal(before+2);
    heap.should.have.property(0).and.equal(test);
    heap.should.have.property(1).and.equal(test2);
  });

  it('.concat()', function () {
    var data = [{ label1: 'concat1' }, { label1: 'concat2' }],
        test = heap.concat(data);

    test.length.should.equal(heap.length + data.length);
    test.should.have.property(0).and.equal(heap[0]);
    test.should.have.property(heap.length).and.equal(data[0]);
    test.should.have.property(heap.length + 1).and.equal(data[1]);
  });

  it('.map()', function () {
    var extractor = function (element) {
          return element.label1;
        },
        test1 = heap.map('label1'),
        test2 = heap.map(extractor),
        i;

    test1.length.should.equal(test2.length);
    test1.length.should.equal(heap.length);

    for(i = test1.length; i--;) {
      expect(test1[i]).to.equal(test2[i]);
    }
  });

  it('.clone() Reol', function () {
    var test = heap.clone();

    test.should.not.equal(heap);
    test.length.should.equal(heap.length);
    test.should.be.instanceof(Reol);
  });

  it('.clone() Bucket', function () {
    var beforeClone = heap.find({ label1: 'test' }),
        test = beforeClone.clone();

    test.should.not.equal(beforeClone);
    test.length.should.equal(beforeClone.length);
    test.should.be.instanceof(Reol.Bucket);
    test.unique.should.equal(beforeClone.unique);
  });

  it('.clone() List', function () {
    var beforeClone = heap.find({ label1: 'test' }).filter({}),
        test = beforeClone.clone();

    test.should.not.equal(beforeClone);
    test.length.should.equal(beforeClone.length);
    test.should.be.instanceof(Reol.List);
  });
});

describe('findByPath tests', function () {
  var data = { 
        yep: "first level",
        foo: { 
          yep: "second level",
          bar: { 
            yep: "third level",
            baz: { 
              yep: "fourth level" 
            }
          }
        }
      },
      findByPath = Reol.List.findByPath;

  it('finds first level', function () {
    findByPath(data, 'yep').should.be.eql("first level");
  });

  it('finds second level', function () {
    findByPath(data, 'foo.yep').should.be.eql("second level");
  });

  it('finds third level', function () {
    findByPath(data, 'foo.bar.yep').should.be.eql("third level");
  });

  it('returns undefined for unknown deep reference', function () {
    expect(findByPath(data, 'foo.bam.yep')).to.be.undefined;
  });

  it('returns undefined for first level reference', function () {
    expect(findByPath(data, 'bam')).to.be.undefined;
  });

  it('returns undefined for empty reference', function () {
    expect(findByPath(data, '')).to.be.undefined;
  });
});
