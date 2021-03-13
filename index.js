/**
 * @typedef {import('@babel/core').PluginPass} PluginPass
 * @typedef {import('@babel/core').NodePath} NodePath
 * @typedef {import('@babel/core').PluginObj} PluginObj
 */

/**
 * Mini script to remove `debug` calls, slightly based on `unassert`.
 *
 * @returns {PluginObj}
 */
export default function undebug() {
  return {
    visitor: {
      ImportDeclaration: importDeclaration,
      CallExpression: callExpression,
      VariableDeclarator: variableDeclarator
    }
  }

  /**
   * Handle an import declaration.
   *
   * @param {NodePath} p
   * @param {PluginPass} state
   */
  function importDeclaration(p, state) {
    /** @type {string[]} */
    // @ts-ignore
    var modules = state.undebugModules || (state.undebugModules = [])

    if (
      p.node.type === 'ImportDeclaration' &&
      p.node.source.value === 'debug' &&
      p.node.specifiers &&
      p.node.specifiers[0]
    ) {
      modules.push(p.node.specifiers[0].local.name)
      p.remove()
    }
  }

  /**
   * Handle a call expression.
   *
   * @param {NodePath} p
   * @param {PluginPass} state
   */
  function callExpression(p, state) {
    /** @type {string[]} */
    // @ts-ignore
    var modules = state.undebugModules || (state.undebugModules = [])
    /** @type {string[]} */
    // @ts-ignore
    var instances = state.undebugInstances || (state.undebugInstances = [])

    // `d()` (where `d` was previously defined to be a debug instance).
    if (
      p.parentPath &&
      p.parentPath.node.type === 'ExpressionStatement' &&
      p.node.type === 'CallExpression' &&
      p.node.callee.type === 'Identifier' &&
      instances.includes(p.node.callee.name)
    ) {
      p.remove()
      return
    }

    // `d()()` (where `d` was previously defined to be a debug module).
    if (
      p.parentPath &&
      p.parentPath.node.type === 'CallExpression' &&
      p.node.type === 'CallExpression' &&
      p.node.callee.type === 'Identifier' &&
      modules.includes(p.node.callee.name)
    ) {
      p.parentPath.remove()
    }
  }

  /**
   * Handle a call expression.
   *
   * @param {NodePath} p
   * @param {PluginPass} state
   */
  function variableDeclarator(p, state) {
    /** @type {string[]} */
    // @ts-ignore
    var modules = state.undebugModules || (state.undebugModules = [])
    /** @type {string[]} */
    // @ts-ignore
    var instances = state.undebugInstances || (state.undebugInstances = [])

    // `var d = require('debug')`
    if (
      p.node.type === 'VariableDeclarator' &&
      p.node.id.type === 'Identifier' &&
      p.node.init &&
      p.node.init.type === 'CallExpression' &&
      p.node.init.callee.type === 'Identifier' &&
      p.node.init.callee.name === 'require' &&
      p.node.init.arguments &&
      p.node.init.arguments[0] &&
      p.node.init.arguments[0].type === 'StringLiteral' &&
      p.node.init.arguments[0].value === 'debug'
    ) {
      modules.push(p.node.id.name)
      p.remove()
      return
    }

    // `var a = require('debug')('a')`
    if (
      p.node.type === 'VariableDeclarator' &&
      p.node.id.type === 'Identifier' &&
      p.node.init &&
      p.node.init.type === 'CallExpression' &&
      p.node.init.callee &&
      p.node.init.callee.type === 'CallExpression' &&
      p.node.init.callee.callee.type === 'Identifier' &&
      p.node.init.callee.callee.name === 'require' &&
      p.node.init.callee.arguments &&
      p.node.init.callee.arguments[0] &&
      p.node.init.callee.arguments[0].type === 'StringLiteral' &&
      p.node.init.callee.arguments[0].value === 'debug'
    ) {
      instances.push(p.node.id.name)
      p.remove()
      return
    }

    // `var a = d('a')` (where `d` is previously defined to be a debug module).
    if (
      p.node.type === 'VariableDeclarator' &&
      p.node.id.type === 'Identifier' &&
      p.node.init &&
      p.node.init.type === 'CallExpression' &&
      p.node.init.callee &&
      p.node.init.callee.type === 'Identifier' &&
      modules.includes(p.node.init.callee.name)
    ) {
      instances.push(p.node.id.name)
      p.remove()
    }
  }
}
