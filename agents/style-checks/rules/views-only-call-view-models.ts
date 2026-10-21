import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const isHookOrViewModel = (name: string) =>
  /^use[A-Z]/.test(name) || name.endsWith('ViewModel')

const isAllowedViewCall = (callee: ts.Node) => {
  if (callee.kind === ts.SyntaxKind.ImportKeyword) return true
  if (ts.isIdentifier(callee)) return isHookOrViewModel(callee.text)
  return ts.isPropertyAccessExpression(callee) && callee.name.text === 'map'
}

export const viewsOnlyCallViewModels: Rule = {
  name: 'views-only-call-view-models',
  applies: isTsxFile,
  enter(node, ctx) {
    if (!ts.isCallExpression(node)) return
    if (isAllowedViewCall(ctx.skipParentheses(node.expression))) return
    ctx.report(
      node,
      'views may only call hooks (use*), view models (*ViewModel), and .map in JSX; derivation belongs in a view model',
    )
  },
}
