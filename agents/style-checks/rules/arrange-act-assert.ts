import ts from 'typescript'
import { isNamedCall } from '../engine/ast.ts'
import { isTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const countBlankLines = (text: string) =>
  text
    .split('\n')
    .slice(1, -1)
    .filter((line) => line.trim() === '').length

const countBlankLinesBetween = (statements: readonly ts.Statement[]) =>
  statements.slice(1).reduce((total, statement, index) => {
    const previous = statements[index]
    const text = statement.getSourceFile().text
    return (
      total + countBlankLines(text.slice(previous.end, statement.getStart()))
    )
  }, 0)

export const arrangeActAssert: Rule = {
  name: 'arrange-act-assert',
  applies: isTestFile,
  enter(node, ctx) {
    if (!isNamedCall(node, 'it')) return
    if (!ts.isCallExpression(node)) return
    const callback = node.arguments[1]
    if (callback === undefined) return
    if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))
      return
    if (!ts.isBlock(callback.body)) return
    if (callback.body.statements.length === 0) return
    const blanks = countBlankLinesBetween(callback.body.statements)
    if (blanks !== 2) {
      ctx.report(
        node,
        `it block must have exactly three AAA sections (found ${blanks} blank lines)`,
      )
    }
  },
}
