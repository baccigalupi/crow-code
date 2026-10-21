import { functionBody } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const bodyLineCount = (text: string) =>
  text
    .split('\n')
    .slice(1, -1)
    .filter((line) => line.trim() !== '').length

export const maxFunctionLines: Rule = {
  name: 'max-function-lines',
  applies: isProductionFile,
  enter(node, ctx) {
    const body = functionBody(node)
    if (body === undefined) return
    const lines = bodyLineCount(ctx.text(body))
    if (lines > 7) {
      ctx.report(node, `function/method body is ${lines} lines; must be ≤ 7`)
    }
  },
}
