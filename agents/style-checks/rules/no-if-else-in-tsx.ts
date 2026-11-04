import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const isElseIf = (node: ts.IfStatement) =>
  ts.isIfStatement(node.parent) && node.parent.elseStatement === node

export const noIfElseInTsx: Rule = {
  name: 'no-if-else-in-tsx',
  applies: isTsxFile,
  enter(node, ctx) {
    if (!ts.isIfStatement(node) || node.elseStatement === undefined) return
    if (isElseIf(node)) return
    ctx.report(
      node,
      'no if/else in tsx; the view model makes the decision, the component renders it',
    )
  },
}
