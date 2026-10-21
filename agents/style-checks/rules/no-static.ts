import ts from 'typescript'
import { modifierKinds } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const isStaticMember = (node: ts.Node) =>
  (ts.isMethodDeclaration(node) ||
    ts.isPropertyDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)) &&
  modifierKinds(node).includes(ts.SyntaxKind.StaticKeyword)

export const noStatic: Rule = {
  name: 'no-static',
  applies: isProductionFile,
  enter(node, ctx) {
    if (isStaticMember(node)) {
      ctx.report(
        node,
        'no static members; use module-level consts or instance fields',
      )
    } else if (ts.isClassStaticBlockDeclaration(node)) {
      ctx.report(node, 'no static blocks; initialize at module level')
    }
  },
}
