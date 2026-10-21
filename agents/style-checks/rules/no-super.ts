import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noSuper: Rule = {
  name: 'no-super',
  applies: isProductionFile,
  enter(node, ctx) {
    if (node.kind === ts.SyntaxKind.SuperKeyword) {
      ctx.report(
        node,
        'no super; subclass field initializers run after super() and clobber inherited constructor state',
      )
    }
  },
}
