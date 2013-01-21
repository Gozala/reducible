# Changes

## 2.0.0 / 2013-01-20

  - Enforce `reduce` contract on the all `reducibles` by making it part of
    `reduce` instead of `reducible`.
  - Anything send after `end` or error in `reducible` is logged as warning
    and ignored down the flow.
  - After interruption of reducible via `reduced(state)` return value from
    consumer must be followed by `end` or error value. If `reducible` sends
    anything else, warning is logged and `end` of `reducible` is enforced.

## 1.0.5 / 2012-12-18

  - Change implementation detail of [reducible][], such that no exceptions
    are thrown, since exceptions makes debugging a lot harder when
    "pause on exceptions" is enabled.

## 1.0.1 / 2012-11-23

  - Add test for [reducible][] tests.
  - Reducible now catches exceptions thrown by [reducible][] definitions.
    Now it's guaranteed that reducing reducible never throws.

## 1.0.0 / 2012-11-23

  - Fork out definition of reducible abstraction from [reducers][]

[reducers]:https://github.com/Gozala/reducers
[reducible]:./reducible.js
