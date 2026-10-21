import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const whileOnlyInfinite: Rule = {
  name: 'while-only-infinite',
  applies: isProductionFile,
  enter(node, ctx) {
    if (!ts.isWhileStatement(node)) return
    if (
      ctx.skipParentheses(node.expression).kind !== ts.SyntaxKind.TrueKeyword
    ) {
      ctx.report(node, 'while only allowed for infinite loops')
    }
  },
}
