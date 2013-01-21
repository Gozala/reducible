"use strict";

var reducible = require("../reducible")

var reduce = require("../reduce")
var end = require("../end")
var reduced = require("../reduced")

var warnings = require("./util").warnings

exports["test reducible"] = function(assert) {
  var actual = []
  var fixture = reducible(function(next, result) {
    result = next(1, result)
    result = next(2, result)
    next(end, result)
  })

  reduce(fixture, function(value, result) {
    actual.push(value, result)
    return result + value
  }, 0)

  assert.deepEqual(actual, [1, 0, 2, 1, end, 3], "reducible works")
}

exports["test data after end is logs warnings"] = warnings(function(assert) {
  var actual = []
  var input = reducible(function(next, initial) {
    var state = next(1, initial)
    state = next(2, state)
    next(end, state)
    next(3, state)
  })

  reduce(input, function(value, result) {
    actual.push(value, result)
    return result + value
  }, 0)

  assert.deepEqual(actual, [
    1, 0,
    2, 1,
    end, 3
  ], "data is accumulated")

  assert.warnings([
    warnings.ended, input, 3
  ], "data after end is logged via warnings")
})

exports["test error force ends reducibles"] = warnings(function(assert) {
  var actual = []
  var boom = Error("boom!!")
  var brax = Error("BraxxxX")
  var fixture = reducible(function(next, result) {
    result = next(1, result)
    next(boom, result)
    next(2)
    next(brax)
    next(3)
    next(end)
    next(4)
  })

  reduce(fixture, function(value, result) {
    actual.push(value, result)
    return result + value
  }, 0)

  assert.deepEqual(actual, [1, 0, boom, 1], "error ends reducible")
  assert.warnings([
    warnings.ended, fixture, 2,
    warnings.ended, fixture, brax,
    warnings.ended, fixture, 3,
    warnings.ended, fixture, end,
    warnings.ended, fixture, 4
  ], "all warnings were logged")
})

exports["test end force end reducibles"] = warnings(function(assert) {
  var actual = []
  var boom = Error("Boom!!")
  var fixture = reducible(function(next, result) {
    result = next(1, result)
    next(end, result)
    next(2)
    next(3)
    next(boom)
    next(4)
    next(end)
    next(5)
  })

  reduce(fixture, function(value, result) {
    actual.push(value, result)
    return result + value
  }, 0)

  assert.deepEqual(actual, [1, 0, end, 1], "end force ends reducible")
  assert.warnings([
    warnings.ended, fixture, 2,
    warnings.ended, fixture, 3,
    warnings.ended, fixture, boom,
    warnings.ended, fixture, 4,
    warnings.ended, fixture, end,
    warnings.ended, fixture, 5
  ], "warnings were logged for items after end")
})

exports["test exceptions force end reducibles"] = warnings(function(assert) {
  var actual = []
  var boom = Error("Boom!!")
  var fixture = reducible(function(next, result) {
    result = next(1, result)
    result = next(2, result)
    result = next(3, result)
    result = next(4, result)
    next(end, result)
  })

  reduce(fixture, function(value, result) {
    if (value === 3) throw boom
    actual.push(value, result)
    return result + value
  }, 0)

  assert.deepEqual(actual, [1, 0, 2, 1, boom, void(0)],
                   "exception force ends reducible")

  assert.warnings([
    warnings.ended, fixture, 4,
    warnings.ended, fixture, end
  ], "Items send after error are logged as warnings")
})

exports["test exceptions in reducible force end"] = function(assert) {
  var actual = []
  var boom = Error("Boom!!")
  var fixture = reducible(function(next, result) {
    result = next(1, result)
    result = next(2, result)
    throw boom
  })

  reduce(fixture, function(value, result) {
    actual.push(value, result)
    return result + value
  }, 0)

  assert.deepEqual(actual, [1, 0, 2, 1, boom, void(0)],
                   "exceptions in reducible force end")
}

exports["test data after reduced logs warnings"] = warnings(function(assert) {
  var actual = []
  var input = reducible(function(next, result) {
    result = next(1, result)
    result = next(2, result)
  })

  reduce(input, function(value, state) {
    actual.push(value, state)
    return reduced(value + state)
  }, 0)

  assert.deepEqual(actual, [1, 0, end, 1], "reduced enforces end")
  assert.warnings([
    warnings.reduced, input, 2
  ], "data send after close logs warnings")
})

exports["test data after reduced then end"] = warnings(function(assert) {
  var actual = []
  var input = reducible(function(next, result) {
    result = next(1, result)
    result = next(2, result)
    next(end, result)
  })

  reduce(input, function(value, state) {
    actual.push(value, state)
    return reduced(value + state)
  }, 0)

  assert.deepEqual(actual, [1, 0, end, 1], "reduced enforces end")
  assert.warnings([
    warnings.reduced, input, 2,
    warnings.ended, input, end
  ], "data send after close logs warnings")
})

exports["test data after reduced then error"] = warnings(function(assert) {
  var boom = Error("boom")
  var actual = []
  var input = reducible(function(next, result) {
    result = next(1, result)
    result = next(2, result)
    next(boom)
  })

  reduce(input, function(value, state) {
    actual.push(value, state)
    return reduced(value + state)
  }, 0)

  assert.deepEqual(actual, [1, 0, end, 1], "reduced enforces end")
  assert.warnings([
    warnings.reduced, input, 2,
    warnings.ended, input, boom
  ], "data send after close logs warnings")
})

if (require.main === module)
  require("test").run(exports)
