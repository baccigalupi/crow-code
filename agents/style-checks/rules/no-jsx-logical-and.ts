import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noJsxLogicalAnd: Rule = {
  name: 'no-jsx-logical-and',
  applies: isTsxFile,
  enter(node, ctx) {
    if (!ts.isJsxExpression(node)) return
    if (node.expression === undefined) return
    const expression = ctx.skipParentheses(node.expression)
    if (!ts.isBinaryExpression(expression)) return
    if (
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      ctx.report(
        expression,
        'no && conditionals in JSX; use a helper component with early return null',
      )
    }
  },
}
