import ts from 'typescript'
import { isTopLevel } from '../engine/ast.ts'
import { isProductionOrTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noModuleFunctionDeclaration: Rule = {
  name: 'no-module-function-declaration',
  applies: isProductionOrTestFile,
  enter(node, ctx) {
    if (ts.isFunctionDeclaration(node) && isTopLevel(ctx)) {
      ctx.report(
        node,
        'module-level functions must be const arrows, not function declarations',
      )
    }
  },
}
