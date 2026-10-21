import ts from 'typescript'
import { isTopLevel } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const screamingCase = /^[A-Z][A-Z0-9_]*$/

export const noScreamingCase: Rule = {
  name: 'no-screaming-case',
  applies: isProductionFile,
  enter(node, ctx) {
    if (!ts.isVariableStatement(node) || !isTopLevel(ctx)) return
    node.declarationList.declarations.forEach((declaration) => {
      if (
        ts.isIdentifier(declaration.name) &&
        screamingCase.test(declaration.name.text)
      ) {
        ctx.report(declaration.name, 'no SCREAMING_CASE names; use camelCase')
      }
    })
  },
}
