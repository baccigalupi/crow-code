import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

// `new ItemViewModel(...)` or its factory, `itemViewModel(...)`.
const builtName = (node: ts.Node) => {
  if (!ts.isNewExpression(node) && !ts.isCallExpression(node)) return
  if (!ts.isIdentifier(node.expression)) return
  const { text } = node.expression
  if (text.endsWith('ViewModel')) return text
}

const declaresClass = (file: ts.Node, name: string): boolean =>
  (ts.isClassDeclaration(file) && file.name?.text === name) ||
  ts.forEachChild(file, (child) => declaresClass(child, name) || undefined) ===
    true

// A view model is built by the component that renders it, from that
// component's own props and the store; never by another view model or module.
// Its own module may build it, in the factory it exports.
export const viewModelsBuiltByComponents: Rule = {
  name: 'view-models-built-by-components',
  applies: isProductionFile,
  enter(node, ctx) {
    const name = builtName(node)
    if (name === undefined || declaresClass(ctx.ancestors[0], name)) return
    ctx.report(
      node,
      'a view model is built only by the component that renders it; hand plain data down instead',
    )
  },
}
