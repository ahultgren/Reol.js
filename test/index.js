"use strict";

var should = require('chai').should(),
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
