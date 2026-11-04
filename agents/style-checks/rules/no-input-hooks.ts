import ts from 'typescript'
import { isAnySourceFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

// Key input belongs to the runner, not the view: it starts a listener class
// on renderer.keyInput after mounting, so components never see the renderer.
const inputHooks = new Set(['useKeyboard', 'usePaste', 'useRenderer'])

const message =
  'input hooks are banned; the runner starts a listener class on renderer.keyInput'

const importedName = (specifier: ts.ImportSpecifier) => {
  if (specifier.propertyName !== undefined) return specifier.propertyName.text
  return specifier.name.text
}

export const noInputHooks: Rule = {
  name: 'no-input-hooks',
  applies: isAnySourceFile,
  enter(node, ctx) {
    if (ts.isImportSpecifier(node) && inputHooks.has(importedName(node))) {
      ctx.report(node, message)
      return
    }
    if (!ts.isCallExpression(node)) return
    if (!ts.isIdentifier(node.expression)) return
    if (inputHooks.has(node.expression.text)) ctx.report(node, message)
  },
}
