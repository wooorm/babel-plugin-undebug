/**
 * @import {PluginObj} from '@babel/core'
 * @import {Expression} from '@babel/types'
 */

/**
 * Plugin to remove `debug` from code.
 *
 * @returns {PluginObj}
 */
export default function undebug() {
  return {
    visitor: {
      ImportDeclaration(p, state) {
        const modules = /** @type {string[]} */ (
          state.undebugModules || (state.undebugModules = [])
        )

        if (
          p.node.type === 'ImportDeclaration' &&
          p.node.source.value === 'debug' &&
          p.node.specifiers &&
          p.node.specifiers[0]
        ) {
          modules.push(p.node.specifiers[0].local.name)
          p.remove()
        }
      },
      CallExpression(p, state) {
        const modules = /** @type {string[]} */ (
          state.undebugModules || (state.undebugModules = [])
        )
        const instances = /** @type {string[]} */ (
          state.undebugInstances || (state.undebugInstances = [])
        )

        // `d()` (where `d` was previously defined to be a debug instance).
        if (
          p.parentPath &&
          p.parentPath.node.type === 'ExpressionStatement' &&
          p.node.type === 'CallExpression' &&
          p.node.callee.type === 'Identifier' &&
          instances.includes(p.node.callee.name)
        ) {
          p.remove()
        }
        // `d()()` (where `d` was previously defined to be a debug module).
        else if (
          p.parentPath &&
          p.parentPath.node.type === 'CallExpression' &&
          p.node.type === 'CallExpression' &&
          p.node.callee.type === 'Identifier' &&
          modules.includes(p.node.callee.name)
        ) {
          p.parentPath.remove()
        }
      },
      VariableDeclarator(p, state) {
        const modules = /** @type {string[]} */ (
          state.undebugModules || (state.undebugModules = [])
        )
        const instances = /** @type {string[]} */ (
          state.undebugInstances || (state.undebugInstances = [])
        )

        // Likely an identifier but can be other things.
        /* c8 ignore next 3 */
        if (p.node.id.type !== 'Identifier' || !p.node.init) {
          return
        }

        if (isRequireDebug(p.node.init)) {
          modules.push(p.node.id.name)
          p.remove()
        } else if (
          isRequireAndCreateDebug(p.node.init) ||
          isCreateDebug(p.node.init, modules)
        ) {
          instances.push(p.node.id.name)
          p.remove()
        } else if (
          p.node.init.type === 'Identifier' &&
          instances.includes(p.node.init.name)
        ) {
          instances.push(p.node.id.name)
          p.remove()
        } else if (
          p.node.init.type === 'MemberExpression' &&
          p.node.init.object.type === 'Identifier' &&
          instances.includes(p.node.init.object.name)
        ) {
          instances.push(p.node.id.name)
          p.remove()
        }
      },
      MemberExpression(p, state) {
        const instances = /** @type {string[]} */ (
          state.undebugInstances || (state.undebugInstances = [])
        )

        if (
          p.node.object.type === 'Identifier' &&
          instances.includes(p.node.object.name)
        ) {
          if (
            // Check if this member expression is being used as a function call
            // and remove the whole call. e.g. log.log("").
            p.parent.type === 'CallExpression' &&
            p.parent.callee === p.node
          ) {
            p.parentPath.remove()
          } else {
            // Otherwise accessing property on a debug instance, replace with
            // undefined e.g. log.enabled, log.color, log.namespace, etc.
            p.replaceWith({
              type: 'Identifier',
              name: 'undefined'
            })
          }
        }
      }
    }
  }
}

/**
 * `var d = require('debug')`
 *
 * @param {Expression} node
 * @returns {boolean}
 */
function isRequireDebug(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments &&
    node.arguments[0] &&
    node.arguments[0].type === 'StringLiteral' &&
    node.arguments[0].value === 'debug'
  )
}

/**
 * `var a = require('debug')('a')`
 *
 * @param {Expression} node
 * @returns {boolean}
 */
function isRequireAndCreateDebug(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee &&
    node.callee.type === 'CallExpression' &&
    node.callee.callee.type === 'Identifier' &&
    node.callee.callee.name === 'require' &&
    node.callee.arguments &&
    node.callee.arguments[0] &&
    node.callee.arguments[0].type === 'StringLiteral' &&
    node.callee.arguments[0].value === 'debug'
  )
}

/**
 * `var a = d('a')` (where `d` is previously defined to be a debug module).
 *
 * @param {Expression} node
 * @param {Array<string>} modules
 * @returns {boolean}
 */
function isCreateDebug(node, modules) {
  return (
    node.type === 'CallExpression' &&
    node.callee &&
    node.callee.type === 'Identifier' &&
    modules.includes(node.callee.name)
  )
}
