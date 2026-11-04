import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const isFunction = (node: ts.Node) =>
  ts.isArrowFunction(node) ||
  ts.isFunctionExpression(node) ||
  ts.isFunctionDeclaration(node)

const definesFunction = (node: ts.VariableDeclaration) =>
  node.initializer !== undefined && isFunction(node.initializer)

// Class members are view models, not components, so the search stops there.
const insideComponent = (node: ts.Node): boolean => {
  if (node.parent === undefined || ts.isClassLike(node.parent)) return false
  return isFunction(node.parent) || insideComponent(node.parent)
}

export const noFunctionsInComponents: Rule = {
  name: 'no-functions-in-components',
  applies: isTsxFile,
  enter(node, ctx) {
    if (!ts.isVariableDeclaration(node) || !definesFunction(node)) return
    if (!insideComponent(node)) return
    ctx.report(
      node,
      'no functions defined in components; put the behavior in a class or a module-level component',
    )
  },
}
