// Mini script for us to remove `debug` calls, slightly based on `unassert`.
module.exports = undebug

function undebug() {
  return {
    visitor: {
      ImportDeclaration: importDeclaration,
      CallExpression: callExpression,
      VariableDeclarator: variableDeclarator
    }
  }
}

function importDeclaration(nodePath, state) {
  var modules = state.undebugModules || (state.undebugModules = [])

  if (
    nodePath.node.source.value === 'debug' &&
    nodePath.node.specifiers &&
    nodePath.node.specifiers[0]
  ) {
    modules.push(nodePath.node.specifiers[0].local.name)
    nodePath.remove()
  }
}

function callExpression(nodePath, state) {
  var modules = state.undebugModules || (state.undebugModules = [])
  var instances = state.undebugInstances || (state.undebugInstances = [])

  // `d()` (where `d` was previously defined to be a debug instance).
  if (
    nodePath.parentPath &&
    nodePath.parentPath.node.type === 'ExpressionStatement' &&
    nodePath.node.callee.type === 'Identifier' &&
    instances.includes(nodePath.node.callee.name)
  ) {
    nodePath.remove()
    return
  }

  // `d()()` (where `d` was previously defined to be a debug module).
  if (
    nodePath.parentPath &&
    nodePath.parentPath.node.type === 'CallExpression' &&
    nodePath.node.callee.type === 'Identifier' &&
    modules.includes(nodePath.node.callee.name)
  ) {
    nodePath.parentPath.remove()
  }
}

function variableDeclarator(nodePath, state) {
  var modules = state.undebugModules || (state.undebugModules = [])
  var instances = state.undebugInstances || (state.undebugInstances = [])

  // `var d = require('debug')`
  if (
    nodePath.node.id.type === 'Identifier' &&
    nodePath.node.init &&
    nodePath.node.init.type === 'CallExpression' &&
    nodePath.node.init.callee.name === 'require' &&
    nodePath.node.init.arguments &&
    nodePath.node.init.arguments[0] &&
    nodePath.node.init.arguments[0].value === 'debug'
  ) {
    modules.push(nodePath.node.id.name)
    nodePath.remove()
    return
  }

  // `var a = require('debug')('a')`
  if (
    nodePath.node.id.type === 'Identifier' &&
    nodePath.node.init &&
    nodePath.node.init.type === 'CallExpression' &&
    nodePath.node.init.callee &&
    nodePath.node.init.callee.type === 'CallExpression' &&
    nodePath.node.init.callee.callee.name === 'require' &&
    nodePath.node.init.callee.arguments &&
    nodePath.node.init.callee.arguments[0] &&
    nodePath.node.init.callee.arguments[0].value === 'debug'
  ) {
    instances.push(nodePath.node.id.name)
    nodePath.remove()
    return
  }

  // `var a = d('a')` (where `d` is previously defined to be a debug module).
  if (
    nodePath.node.id.type === 'Identifier' &&
    nodePath.node.init &&
    nodePath.node.init.type === 'CallExpression' &&
    nodePath.node.init.callee &&
    nodePath.node.init.callee.type === 'Identifier' &&
    modules.includes(nodePath.node.init.callee.name)
  ) {
    instances.push(nodePath.node.id.name)
    nodePath.remove()
  }
}
