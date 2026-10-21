import ts from 'typescript'
import { isTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const temporaryDirectoryMethods = new Set(['makeTempDir', 'makeTempDirSync'])

export const noTemporaryDirectories: Rule = {
  name: 'no-temporary-directories',
  applies: isTestFile,
  enter(node, ctx) {
    if (!ts.isCallExpression(node)) return
    const callee = node.expression
    if (!ts.isPropertyAccessExpression(callee)) return
    if (!ts.isIdentifier(callee.expression)) return
    if (callee.expression.text !== 'Deno') return
    if (temporaryDirectoryMethods.has(callee.name.text)) {
      ctx.report(
        node,
        'no temporary directories in tests; use fixed fixture paths under tests/support/fixtures',
      )
    }
  },
}
