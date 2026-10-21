import ts from 'typescript'
import { isNamedCall } from '../engine/ast.ts'
import { isTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const oneTopLevelDescribe: Rule = {
  name: 'one-top-level-describe',
  applies: isTestFile,
  enter(node, ctx) {
    if (!ts.isSourceFile(node)) return
    const describes = node.statements.filter(
      (statement) =>
        ts.isExpressionStatement(statement) &&
        isNamedCall(statement.expression, 'describe'),
    ).length
    if (describes !== 1) {
      ctx.report(
        node,
        `tests must have exactly one top-level describe (found ${describes})`,
      )
    }
  },
}
