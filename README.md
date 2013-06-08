# Reol.js

_Keep an array of objects indexed by field, for super-fast retrieval._

Have you ever created an array, filled it with objects, and then wanted to sometimes 
retrieve the objects based on "id", but sometimes based on "slug"? Did you simple 
create a `find(key, value)` method? That's okay, I've done it too. Just keep reading 
though, you'll love this module.

Reol lets you create an array of objects pretty much like you've always done, but 
you can also specify fields to be indexed. The advantage of indexes is that 
retrieving an object based on the value of an indexed field is a lot faster.

In short, this module is ideal when you have a lot of objects which you want to 
find based on some keys, where the indexed values do not change and elements do 
not need to be removed.


### How fast?

* Read
    * Small array (10 elements): Twice as fast
    * Large array (10 000 elements): **~200 times faster**
* Write
    * A tenth as fast.

As you can see, Reol's strength is when you're reading more than writing.
Run `make benchmark` to test yourself on your own machine or check out
[this jsperf test](http://jsperf.com/reol-js-vs-naive-search/10) for fancy graphs.


## Installation

### Node.js

* `npm install reol -S`
* `var Reol = require('reol'); // To use in scripts`

### Bower

* `bower install reol`
* `var Reol = window.Reol; // Reol is already exposed as global, or through require('Reol')

### Vanilla js

Just copy `dist/reol.min.js` and put it where you like it. Reol should work in 
all js environments, including commonJS (node) and AMD (requireJS) as well as 
old-fashioned `<script src="dist/reol.min.js"></script>`-style.


## Examples

Create an instance

```javascript
// Array
var array = [];

// Reol
var list = new Reol({
  test: true,
  'parent.child': true // Supports deep indexing
});
```

Create and add a bunch of elements at the same time

```javascript
// Array
var array = [obj1, obj2, obj3];

// Reol
var list = new Reol({
  test: true,
  'parent.child': true // Supports deep indexing
}).merge(array);
```

Add an element

```javascript
// Array
array.push(obj);

// Reol
list.add({
  test: 'meow',
  parent: {
    child: 'baahh'
  }
}).add(obj4); // Chain adds if you feel like, just 'cause you can
```

Indexing works even with undefined and complex values, though the latter is not
recommended. If you want to index objects, implement a custom .toString method,
or they will all be treated as the same value.

```javascript
list.add({
  test: function(){
    console.log("seriously, avoid doing this");
  },
  parent: {
    child: {
      and: 'this'
    }
  }
});

// Un-indexed fields also work
list.add({
  woot: 'mooo'
});

// Find all matches
list.find({ test: 'meow' });

// findOne will speed up best-case scenarios for queries on un-indexed fields
list.findOne({ woot: 'mooo' });
```

Searching on multiple fields is not allowed. Use filtering instead.

```javascript
// By matching an object
list.find({ test: 'meow' }).filter({ 'nested.child': 'baah' });

// By supplying your own comparison function, [].filter() style
list.find({ test: 'meow' }).filter(function (element) {
  return !!(element.nested && element.nested.child === 'baah');
});
```

You can copy lists using clone

```javascript
var newList = list.clone();
var evenNewer = newList.find({ test: 'test' }).clone();
```

Removing elements working since 0.3.

```javascript
// First find or filter out the unwanted elements, the .remove() them
list.find({ test: 'meow' }).remove();

// Or supply a collection of elements
list.remove(list.find({ test: 'meow' }));

// Note that this removes the element(s) from the parent element (eg "list")
// Create a new instance with .clone() to remove elements from only that set
list.find({ test: 'meow' }).clone().filter({ more: 'conditions' }).remove();
```

You can also use the following regular array-methods:

* .push()
* .unshift()
* .concat()
* .pop()
* .shift()
* .splice()
* .filter()
* .map()

These are reimplemented as close to the native ones as possible. Accessor
methods returns the element (or an instance of Reol.List in case of multiple 
elements) while mutator methods returns itself so it can be chained (unless it's
supposed to return a result of course). All other methods are left with the 
native implementation and should work but are not tested.


## Todo

_Ordered somewhat by simpleness and likelihood of being implemented._

* Method aliases to behave consistently with native arrays
* .remove() stuff
* A way too hook in external functionality, for example persisting data in localStorage
* Reindexing objects whose indexed field has changed
* Compound index
* Super-fast sorting by keeping sorted arrays ready?


## Contribution

I just threw this together in a few hours to solve my problem at hand. If you
want to pick something on the todo list or have an opinion on how some method
should be implemented (or maybe not implemented at all), please don't hestitate
to create an issue, submit a pull request, tweet/email me or whatever.

For example I'm at the moment not sure if I should keep Reol as a very small
and basic utility or extend it with rather complex (but some might argue essential)
functionality such as .remove() and advanced indexing.

When contributing, please take care to maintain the current coding style and add
tests for any added/changed functionality, and issue the pull-request to the
develop branch from your own feature-branch. Also avoid unnecessary merges,
it's just ugly.


## Contributors

* [rodneyrehm](https://github.com/rodneyrehm)
* [boneskull](https://github.com/boneskull)
* [arnorhs](https://github.com/arnorhs)
* [Add yourself when contributing]


## Testing

Run `make test` to test.


## License

MIT
