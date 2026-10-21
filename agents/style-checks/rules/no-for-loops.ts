import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noForLoops: Rule = {
  name: 'no-for-loops',
  applies: isProductionFile,
  enter(node, ctx) {
    if (ts.isForStatement(node)) {
      ctx.report(node, 'collections use iterators; no for loops')
    } else if (ts.isForInStatement(node)) {
      ctx.report(node, 'collections use iterators; no for-in loops')
    } else if (ts.isForOfStatement(node)) {
      ctx.report(node, 'collections use iterators; no for-of loops')
    }
  },
}
