import ts from 'typescript'
import { isProductionOrTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noSuper: Rule = {
  name: 'no-super',
  applies: isProductionOrTestFile,
  enter(node, ctx) {
    if (node.kind === ts.SyntaxKind.SuperKeyword) {
      ctx.report(
        node,
        'no super; subclass field initializers run after super() and clobber inherited constructor state',
      )
    }
  },
}
