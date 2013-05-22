"use strict";

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
      label1: true,
      'nested.child': true
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

  it('Querying on non-index fields works', function () {
    heap.find({ unIndexedField: 'meow' }).should.have.property(0).and.equal(testObj);
  });

  it('Deep indexing works', function () {
    heap.find({ 'nested.child': testObj.nested.child }).should.have.property(0).and.equal(testObj);
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
  };

  it('finds first level', function () {
    Reol.findByPath(data, 'yep').should.be.eql("first level");
  });

  it('finds second level', function () {
    Reol.findByPath(data, 'foo.yep').should.be.eql("second level");
  });

  it('finds third level', function () {
    Reol.findByPath(data, 'foo.bar.yep').should.be.eql("third level");
  });

  it('returns undefined for unknown deep reference', function () {
    expect(Reol.findByPath(data, 'foo.bam.yep')).to.be.undefined;
  });

  it('returns undefined for first level reference', function () {
    expect(Reol.findByPath(data, 'bam')).to.be.undefined;
  });

  it('returns undefined for empty reference', function () {
    expect(Reol.findByPath(data, '')).to.be.undefined;
  });
});
