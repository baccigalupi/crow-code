import ts from 'typescript'
import { isNamedCall } from '../engine/ast.ts'
import { isTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const collectionMethods = new Set([
  'map',
  'filter',
  'some',
  'every',
  'find',
  'findIndex',
  'reduce',
  'flatMap',
  'forEach',
  'sort',
])

const isCollectionMethodCall = (node: ts.CallExpression) =>
  ts.isPropertyAccessExpression(node.expression) &&
  collectionMethods.has(node.expression.name.text)

export const noLogicInTests: Rule = {
  name: 'no-logic-in-tests',
  applies: isTestFile,
  enter(node, ctx) {
    if (!ts.isCallExpression(node)) return
    if (!ctx.ancestors.some((ancestor) => isNamedCall(ancestor, 'it'))) return
    if (isCollectionMethodCall(node)) {
      ctx.report(node, 'no logic in tests: assert directly on the result')
      return
    }
    if (!isNamedCall(node, 'expect')) return
    if (
      !ctx.ancestors.some((ancestor) =>
        ts.isIterationStatement(ancestor, false),
      )
    )
      return
    ctx.report(
      node,
      'expect must not be inside a loop: assert each element explicitly',
    )
  },
}
