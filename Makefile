TESTS = test/*.js
test:
	grunt
	mocha $(TESTS)

benchmark:
	node benchmark/index.js

.PHONY: test benchmark
