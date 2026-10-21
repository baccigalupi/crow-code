import ts from 'typescript'
import { isNamedCall } from '../engine/ast.ts'
import { isTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const minimumNestedTests = 3

const countDirectTests = (callback: ts.Node | undefined) => {
  if (callback === undefined) return 0
  if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))
    return 0
  if (!ts.isBlock(callback.body)) return 0
  return callback.body.statements.filter(
    (statement) =>
      ts.isExpressionStatement(statement) &&
      isNamedCall(statement.expression, 'it'),
  ).length
}

export const nestedDescribeMinimum: Rule = {
  name: 'nested-describe-minimum',
  applies: isTestFile,
  enter(node, ctx) {
    if (!isNamedCall(node, 'describe')) return
    if (!ts.isCallExpression(node)) return
    if (!ctx.ancestors.some((ancestor) => isNamedCall(ancestor, 'describe')))
      return
    const tests = countDirectTests(node.arguments[1])
    if (tests >= minimumNestedTests) return
    ctx.report(
      node,
      `nested describe needs at least three tests (found ${tests})`,
    )
  },
}
