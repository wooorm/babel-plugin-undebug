import assert from 'node:assert/strict'
import test from 'node:test'
import babel from '@babel/core'
import plugin from './index.js'

test('babel-plugin-undebug', function () {
  assert.equal(transform(''), '', 'should not crash on an empty file')

  assert.equal(
    transform('var d = require("debug"); var a = d("a"); a("b")'),
    '',
    'should support requiring debug and making instances later'
  )

  assert.equal(
    transform('var a = require("debug")("a"); a("b")'),
    '',
    'should support make an instance from a debug require'
  )

  assert.equal(
    transform(
      'var a = require("debug"); var b = require("debug")("b"); var c = require("debug")("c"); a("x")(1); b(2); c(3)'
    ),
    '',
    'should support requiring `debug` several times, in several ways'
  )

  assert.equal(
    transform('import d from "debug"; var a = d("a"); a("b")'),
    '',
    'should support importing default debug and making instances later'
  )

  assert.equal(
    transform('import {debug as d} from "debug"; var a = d("a"); a("b")'),
    '',
    'should support importing `debug` from debug and making instances later'
  )

  assert.equal(
    transform('var a = require("assert"); assert("a");'),
    'var a = require("assert");\nassert("a");',
    'should not remove other require calls'
  )

  assert.equal(
    transform('import assert from "assert"; assert("a");'),
    'import assert from "assert";\nassert("a");',
    'should not remove other imports'
  )

  assert.equal(
    transform('a(1); b = 1 + 1; c()(); d.e(); f("g")'),
    'a(1);\nb = 1 + 1;\nc()();\nd.e();\nf("g");',
    'should not remove other calls'
  )

  assert.equal(
    transform(
      'import {debug as d} from "debug"; var a = d("a"); var b = a; b("c");'
    ),
    '',
    'should support aliased callers'
  )

  assert.equal(
    transform('import {debug as d} from "debug"; var a = d("a"); a.log("b");'),
    '',
    'should remove member property function calls'
  )

  assert.equal(
    transform(
      'import {debug as d} from "debug"; var a = d("a"); console.log("is a.enabled?", a.enabled)'
    ),
    'console.log("is a.enabled?", undefined);',
    'should replace member properties with undefined'
  )

  assert.equal(
    transform(
      'import {debug as d} from "debug"; var a = d("a"); var b = a; console.log("is b.enabled?", b.enabled)'
    ),
    'console.log("is b.enabled?", undefined);',
    'should replace aliased member properties with undefined'
  )

  assert.equal(
    transform(
      'import {debug as d} from "debug"; var a = d("a"); var b = a.log; b("c");'
    ),
    '',
    'should remove aliased member property function calls'
  )

  assert.equal(
    transform(
      'import {debug as d} from "debug"; var a = d("a"); var b = a; b.log("c");'
    ),
    '',
    'should remove alias that uses a member property'
  )
})

/**
 * @param {string} value Input
 * @returns {string|undefined} Output
 */
function transform(value) {
  const result = babel.transformSync(value, {
    configFile: false,
    plugins: [plugin]
  })
  assert(result, 'expected result')
  return typeof result.code === 'string' ? result.code : undefined
}
