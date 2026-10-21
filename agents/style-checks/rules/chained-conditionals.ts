import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Context, Rule } from '../engine/types.ts'

type Run = { start: number; key: string }

const comparisons = [
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
]

const isDiscriminant = (node: ts.Node) =>
  ts.isIdentifier(node) ||
  ts.isPropertyAccessExpression(node) ||
  ts.isElementAccessExpression(node)

const discriminant = (statement: ts.Statement, ctx: Context) => {
  if (!ts.isIfStatement(statement) || statement.elseStatement) return ''
  const test = ctx.skipParentheses(statement.expression)
  if (!ts.isBinaryExpression(test)) return ''
  if (!comparisons.includes(test.operatorToken.kind)) return ''
  const left = ctx.skipParentheses(test.left)
  if (!isDiscriminant(left)) return ''
  return ctx.text(left)
}

const step = (run: Run, block: ts.Block, index: number, ctx: Context) => {
  const key = discriminant(block.statements[index], ctx)
  if (key === '') {
    run.start = -1
    run.key = ''
  } else if (key !== run.key) {
    run.start = index
    run.key = key
  } else if (index - run.start + 1 >= 3) {
    ctx.report(
      block.statements[run.start],
      'mutually exclusive branches must use if/else if/else, not consecutive ifs',
    )
    run.start = -1
    run.key = ''
  }
}

export const chainedConditionals: Rule = {
  name: 'chained-conditionals',
  applies: isProductionFile,
  enter(node, ctx) {
    if (!ts.isBlock(node)) return
    const run: Run = { start: -1, key: '' }
    node.statements.forEach((_statement, index) => step(run, node, index, ctx))
  },
}
