"use strict";

var reduce = require("../reduce")
var reducible = require("../reducible")
var end = require("../end")
var reduced = require("../reduced")

exports["test thrown errors with arrays"] = function (assert) {
  var called = 0
  var callbackCalled = 0

  var toArray = function (source, callback) {
    reduce(source, function (value, buffer) {
      called++
      assert.ok(!(value instanceof Error), "value is not an Error")
      if (value === end) {
        callback(null, buffer)
      } else {
        buffer.push(value)
      }

      return buffer
    }, [])
  }

  toArray([1,2,3], function (err, result) {
    callbackCalled++
    assert.equal(err, null, "err is null")
    assert.deepEqual(result, [1, 2, 3], "result is array")
  })

  assert.equal(called, 4, "toArray is called 4 times")
  assert.equal(callbackCalled, 1, "callback is called once")

  assert.throws(function () {
    toArray([1,2,3], function (err, result) {
      callbackCalled++
      throw new Error("Some Error")
    })
  }, /Some Error/, "Some Error is thrown")

  assert.equal(called, 8, "toArray is called 8 times")
  assert.equal(callbackCalled, 2, "callback is called twice")
}

exports["test thrown errors with reducible"] = function (assert) {
  var called = 0
  var callbackCalled = 0

  var list = function (source) {
    return reducible(function (next, accumulator) {
      for (var i = 0; i < source.length; i++) {
        accumulator = next(source[i], accumulator)
      }

      next(end, accumulator)
    })
  }

  var toArray = function (source, callback) {
    reduce(source, function (value, buffer) {
      called++
      assert.ok(!(value instanceof Error), "value is not an Error")
      if (value === end) {
        callback(null, buffer)
      } else {
        buffer.push(value)
      }

      return buffer
    }, [])
  }

  toArray(list([1,2,3]), function (err, result) {
    callbackCalled++
    assert.equal(err, null, "err is null")
    assert.deepEqual(result, [1, 2, 3], "result is array")
  })

  assert.equal(called, 4, "toArray is called 4 times")
  assert.equal(callbackCalled, 1, "callback is called once")

  assert.throws(function () {
    toArray(list([1,2,3]), function (err, result) {
      callbackCalled++
      throw new Error("Some Error")
    })
  }, /Some Error/, "Some Error is thrown")

  assert.equal(called, 8, "toArray is called 8 times")
  assert.equal(callbackCalled, 2, "callback is called twice")
}

if (require.main === module)
  require("test").run(exports)
