import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const buildsViewModel = (node: ts.NewExpression) =>
  ts.isIdentifier(node.expression) && node.expression.text.endsWith('ViewModel')

// A view model is built by the component that renders it, from that
// component's own props and the store; never by another view model or module.
export const viewModelsBuiltByComponents: Rule = {
  name: 'view-models-built-by-components',
  applies: isProductionFile,
  enter(node, ctx) {
    if (!ts.isNewExpression(node) || !buildsViewModel(node)) return
    ctx.report(
      node,
      'a view model is built only by the component that renders it; hand plain data down instead',
    )
  },
}
