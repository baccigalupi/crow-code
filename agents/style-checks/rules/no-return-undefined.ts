import ts from 'typescript'
import { isProductionOrTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noReturnUndefined: Rule = {
  name: 'no-return-undefined',
  applies: isProductionOrTestFile,
  enter(node, ctx) {
    if (!ts.isReturnStatement(node) || node.expression === undefined) return
    const value = ctx.skipParentheses(node.expression)
    if (ts.isIdentifier(value) && value.text === 'undefined') {
      ctx.report(node, 'use bare return, not return undefined')
    }
  },
}
