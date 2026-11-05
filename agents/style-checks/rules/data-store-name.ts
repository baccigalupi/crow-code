import ts from 'typescript'
import { isTuiFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

// The TUI's DataStore is a store, not a model; it is never named model.
export const dataStoreName: Rule = {
  name: 'data-store-name',
  applies: isTuiFile,
  enter(node, ctx) {
    if (!ts.isIdentifier(node) || node.text !== 'model') return
    ctx.report(node, 'the DataStore is a store; name it store, not model')
  },
}
