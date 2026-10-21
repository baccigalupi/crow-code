import ts from 'typescript'
import { isFunctionLike } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noNestedFunctionDeclarations: Rule = {
  name: 'no-nested-function-declarations',
  applies: isProductionFile,
  enter(node, ctx) {
    if (ts.isFunctionDeclaration(node) && ctx.ancestors.some(isFunctionLike)) {
      ctx.report(
        node,
        'no nested function declarations; use an arrow function or callback',
      )
    }
  },
}
