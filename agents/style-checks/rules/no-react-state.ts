import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const reactStateHooks = new Set(['useState', 'useReducer'])

const message =
  'react state hooks are banned; state is @preact/signals-core signals'

const importedName = (specifier: ts.ImportSpecifier) => {
  if (specifier.propertyName !== undefined) return specifier.propertyName.text
  return specifier.name.text
}

export const noReactState: Rule = {
  name: 'no-react-state',
  applies: isTsxFile,
  enter(node, ctx) {
    if (ts.isImportSpecifier(node) && reactStateHooks.has(importedName(node))) {
      ctx.report(node, message)
      return
    }
    if (!ts.isCallExpression(node)) return
    if (!ts.isIdentifier(node.expression)) return
    if (reactStateHooks.has(node.expression.text)) ctx.report(node, message)
  },
}
