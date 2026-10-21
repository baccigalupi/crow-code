import ts from 'typescript'
import { isHooksFile, isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noInlineUseInput: Rule = {
  name: 'no-inline-use-input',
  applies: (fileName) => isTsxFile(fileName) && !isHooksFile(fileName),
  enter(node, ctx) {
    if (!ts.isCallExpression(node)) return
    if (!ts.isIdentifier(node.expression)) return
    if (node.expression.text === 'useInput') {
      ctx.report(
        node,
        'input handling lives in dedicated hooks/, not inline useInput in a view',
      )
    }
  },
}
