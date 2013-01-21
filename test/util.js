"use strict";

function warnings(test) {
  return function(assert) {
    var warn = console.warn
    var actual = []
    console.warn = function() {
      actual.push.apply(actual, arguments)
    }
    try {
      assert.warnings = function(expected, message) {
        assert.deepEqual(actual, expected, message)
      }
      test(assert)
    } finally {
      console.warn = warn
    }
  }
}
warnings.ended = "Source attempted to send item after it ended"
warnings.reduced = "Source attempted to send item after it was reduced / closed"

exports.warnings = warnings
