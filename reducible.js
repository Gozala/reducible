"use strict";

var reduce = require("./reduce")
var end = require("./end")
var isError = require("./is-error")
var isReduced = require("./is-reduced")
var reduced = require("./reduced")

function Reducible(reduce) {
  /**
  Reducible is a type of the data-structure that represents something
  that can be reduced. Most of the time it's used to represent transformation
  over other reducible by capturing it in a lexical scope.

  Reducible has an attribute `reduce` pointing to a function that does
  reduction.
  **/

  // JS engines optimize access to properties that are set in the constructor's
  // so we set it here.
  this.reduce = reduce
}

// Implementation of `accumulate` for reducible, which just delegates to it's
// `reduce` attribute.
reduce.define(Reducible, function reduceReducible(reducible, next, initial) {
  var result
  // State is intentionally accumulated in the outer variable, that way no
  // matter if consumer is broken and passes in wrong accumulated state back
  // this reducible will still accumulate result as intended.
  var state = initial
  reducible.reduce(function forward(value) {
    // If reduction has already being completed return is set to
    // an accumulated state boxed via `reduced`. It's set to state
    // that is return to signal input that reduction is complete.
    if (result) state = result
    // if dispatched `value` is is special `end` of input one or an error
    // just forward to reducer and store last state boxed as `reduced` into
    // state. Later it will be assigned to result and returned to input
    // to indicate end of reduction.
    else if (value === end || isError(value)) {
      next(value, state)
      state = reduced(state)
    }
    // if non of above just accumulate new state by passing value and
    // previously accumulate state to reducer.
    else state = next(value, state)

    // If state is boxed with `reduced` then accumulation is complete.
    // Indicated explicitly by a reducer or by end / error of the input.
    // Either way store it to the result in case broken input attempts to
    // call forward again.
    if (isReduced(state)) result = state

    // return accumulated state back either way.
    return state
  })
})

function reducible(reduce) {
  return new Reducible(reduce)
}
reducible.type = Reducible

module.exports = reducible
