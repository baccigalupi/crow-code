import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noThrow: Rule = {
  name: 'no-throw',
  applies: isProductionFile,
  enter(node, ctx) {
    if (ts.isThrowStatement(node)) {
      ctx.report(node, 'no throws unless user asked or approved')
    }
  },
}
