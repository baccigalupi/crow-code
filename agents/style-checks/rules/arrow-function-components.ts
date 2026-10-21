import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const arrowFunctionComponents: Rule = {
  name: 'arrow-function-components',
  applies: isTsxFile,
  enter(node, ctx) {
    if (ts.isFunctionDeclaration(node)) {
      ctx.report(
        node,
        'tsx components must be const arrows, not function declarations',
      )
    }
  },
}
