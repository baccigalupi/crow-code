import ts from 'typescript'
import { isTsxOrTestTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const arrowFunctionComponents: Rule = {
  name: 'arrow-function-components',
  applies: isTsxOrTestTsxFile,
  enter(node, ctx) {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      ctx.report(
        node,
        'tsx functions must be const arrows, not function declarations or expressions',
      )
    }
  },
}
