"use strict";

var globalScope = typeof window !== "undefined" ?
  window : typeof global !== "undefined" ?
  global : {}

if (globalScope["__gozala/reducibe__is__defined"]) {
  console.warn("There are two copies of reducible/reduce. This will most " +
    "likely cause problems. You should npm dedup")
} else {
  globalScope["__gozala/reducibe__is__defined"] = true
}

var method = require("method")

var isReduced = require("./is-reduced")
var isError = require("./is-error")
var reduced = require("./reduced")
var end = require("./end")

var WARN_ENDED = "Source attempted to send item after it ended"
var WARN_REDUCED = "Source attempted to send item after it was reduced / closed"

var internalReduce = method("reduce")

function reduce(reducible, next, initial) {
  var isEnded = false
  var isInterrupted = false
  var result = void(0)
  try {
    internalReduce(reducible, function forward(value, state) {
      try {
        // If `reducible` input has ended it's not supposed to send any more
        // values. If it still does, warning is logged and accumulated state
        // boxed in `reduced` is returned back. This attempting to close
        // `reducible` and if it's not totally broken it will stop.
        if (isEnded) {
          console.warn(WARN_ENDED, reducible, value)
          return result
        }
        // If sent `value` is a special `end` indicating "proper end of
        // reducible" or an error type value indicating "broken end of
        // reducible" just forward it to reducer and store `state` boxed
        // with `reduced` into `result` so it can be returned back if
        // `reducible` will attempt to sending more values. `isEnded` is
        // also set to `true` to mark it ended.
        else if (value === end || isError(value)) {
          isEnded = true
          result = reduced(state)
          state = next(value, state)
        }
        // If `reducible` was interrupted by reducer via `reduced(result)`
        // return value it's not supposed to send any more data, instead it
        // supposed to end with or without an error. If data is still send
        // though warning is logged and end of reducible is enforced by sending
        // `end` down the flow. `isEnded` is also set to `true` so that any
        // further sends log as a warnings.
        else if (isInterrupted) {
          console.warn(WARN_REDUCED, reducible, value)
          isEnded = true
          next(end, result.value)
          return result
        }
        // If it's non of the above cases, just accumulate new state by passing
        // `value` and previous `state` down the flow.
        else {
          state = next(value, state)

          // If accumulated `state` is boxed with `reduced` then accumulation
          // is complete. In such case set `isInterrupted` to `true` to mark
          // `reducible` interrupted and save `state` as a result of reduction.
          // This way if `reducible` sends more data instead of ending
          // `reducible` warnings will be logged.
          if (isReduced(state)) {
            isInterrupted = true
            result = state
          }
        }

        // return accumulated state back to reducible.
        return state
      }
      // If error is thrown then forward it to the reducer so that it can be
      // recovery logic could be executed. Since error occurred this
      // `reducible` is considered ended, so `isEnded` is set to `true` and
      // last `state` boxed in `reduced` is saved as a result. Note that
      // `result` is also returned back to `reducible` in order to interrupt it.
      catch (error) {
        isEnded = true
        result = reduced(state)
        next(error)
        return result
      }
    }, initial)
  }
  // It could be that attempt to reduce underlaying reducible throws, if that
  // is the case still forward an `error` to a reducer and store reduced state
  // into result, in case process of reduction started before exception and
  // forward will still be called. Return result either way to signal
  // completion.
  catch (error) {
    // If `isEnded` is `true`, then `reducible` is synchronous and error was
    // already caught by inner catch clause so it's just thrown out.
    if (isEnded) throw error
    // Otherwise maker `reducible` as ended forward `error` down the flow so
    // it could be recovered from and save `reduced(initial)` to interrupt
    // `reducible` in case it will still attempts to send data.
    isEnded = true
    result = reduced(initial)
    next(error)
  }
}
// Transplant method internals to the `reduce` so that it can be used for both
// defining new reducibles and for performing actual reduce.
reduce.method = internalReduce
reduce.toString = internalReduce.toString
reduce.define = internalReduce.define
reduce.implement = internalReduce.implement

// Implementation of `reduce` for the empty collections, that immediately
// signals reducer that it's ended.
reduce.empty = function reduceEmpty(empty, next, initial) {
  next(end, initial)
}

// Implementation of `reduce` for the singular values which are treated
// as collections with a single element. Yields a value and signals the end.
reduce.singular = function reduceSingular(value, next, initial) {
  next(end, next(value, initial))
}

// Implementation of `reduce` for the array (and alike) values, such that it
// will call accumulator function `next` each time with next item and
// accumulated state until it's exhausted or `next` returns marked value
// indicating that it's reduced. Either way signals `end` to an accumulator.
reduce.indexed = function reduceIndexed(indexed, next, initial) {
  var state = initial
  var index = 0
  var count = indexed.length
  while (index < count) {
    var value = indexed[index]
    state = next(value, state)
    index = index + 1
    if (value === end) return end
    if (isError(value)) return state
    if (isReduced(state)) return state.value
  }
  next(end, state)
}

// Both `undefined` and `null` implement accumulate for empty sequences.
reduce.define(void(0), reduce.empty)
reduce.define(null, reduce.empty)

// Array and arguments implement accumulate for indexed sequences.
reduce.define(Array, reduce.indexed)

function Arguments() { return arguments }
Arguments.prototype = Arguments()
reduce.define(Arguments, reduce.indexed)

// All other built-in data types are treated as single value collections
// by default. Of course individual types may choose to override that.
reduce.define(reduce.singular)

// Errors just yield that error.
reduce.define(Error, function(error, next) { next(error) })

module.exports = reduce
