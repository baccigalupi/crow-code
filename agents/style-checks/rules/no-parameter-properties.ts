import ts from 'typescript'
import { modifierKinds } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const propertyModifiers = [
  ts.SyntaxKind.PublicKeyword,
  ts.SyntaxKind.PrivateKeyword,
  ts.SyntaxKind.ProtectedKeyword,
  ts.SyntaxKind.ReadonlyKeyword,
  ts.SyntaxKind.OverrideKeyword,
]

export const noParameterProperties: Rule = {
  name: 'no-parameter-properties',
  applies: isProductionFile,
  enter(node, ctx) {
    if (!ts.isParameter(node)) return
    if (!modifierKinds(node).some((kind) => propertyModifiers.includes(kind)))
      return
    ctx.report(
      node,
      'constructors must use explicit typed attributes, no parameter properties',
    )
  },
}
