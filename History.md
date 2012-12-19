# Changes

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
