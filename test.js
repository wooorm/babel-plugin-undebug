import assert from 'node:assert'
import test from 'tape'
import babel from '@babel/core'
import plugin from './index.js'

test('babel-plugin-undebug', function (t) {
  t.equal(transform(''), '', 'should not crash on an empty file')

  t.equal(
    transform('var d = require("debug"); var a = d("a"); a("b")'),
    '',
    'should support requiring debug and making instances later'
  )

  t.equal(
    transform('var a = require("debug")("a"); a("b")'),
    '',
    'should support make an instance from a debug require'
  )

  t.equal(
    transform(
      'var a = require("debug"); var b = require("debug")("b"); var c = require("debug")("c"); a("x")(1); b(2); c(3)'
    ),
    '',
    'should support requiring `debug` several times, in several ways'
  )

  t.equal(
    transform('import d from "debug"; var a = d("a"); a("b")'),
    '',
    'should support importing default debug and making instances later'
  )

  t.equal(
    transform('import {debug as d} from "debug"; var a = d("a"); a("b")'),
    '',
    'should support importing `debug` from debug and making instances later'
  )

  t.equal(
    transform('var a = require("assert"); assert("a");'),
    'var a = require("assert");\nassert("a");',
    'should not remove other require calls'
  )

  t.equal(
    transform('import assert from "assert"; assert("a");'),
    'import assert from "assert";\nassert("a");',
    'should not remove other imports'
  )

  t.equal(
    transform('a(1); b = 1 + 1; c()(); d.e(); f("g")'),
    'a(1);\nb = 1 + 1;\nc()();\nd.e();\nf("g");',
    'should not remove other calls'
  )

  t.end()
})

/**
 * @param {string} value Input
 * @params {string} Output
 */
function transform(value) {
  const result = babel.transformSync(value, {
    configFile: false,
    plugins: [plugin]
  })
  assert(result !== null, 'expected result')
  return result.code
}
