import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noTernary: Rule = {
  name: 'no-ternary',
  applies: isProductionFile,
  enter(node, ctx) {
    if (ts.isConditionalExpression(node)) {
      ctx.report(node, 'conditionals must be flat; no ternary operator (?:)')
    }
  },
}
