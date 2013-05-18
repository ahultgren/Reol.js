TESTS = test/*.js
test:
	grunt
	mocha $(TESTS)

.PHONY: test
