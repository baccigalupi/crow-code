import ts from 'typescript'
import { functionBody } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Context, Rule } from '../engine/types.ts'

const containsReturn = (node: ts.Statement): boolean => {
  if (ts.isReturnStatement(node)) return true
  return ts.isBlock(node) && node.statements.some(containsReturn)
}

const isSingleReturn = (node: ts.Statement) => {
  if (ts.isReturnStatement(node)) return true
  return (
    ts.isBlock(node) &&
    node.statements.length === 1 &&
    ts.isReturnStatement(node.statements[0])
  )
}

const checkGuard = (statement: ts.Statement, index: number, ctx: Context) => {
  if (!ts.isIfStatement(statement) || statement.elseStatement) return
  if (!containsReturn(statement.thenStatement)) return
  if (index > 0) {
    ctx.report(
      statement,
      'guard clauses must be on the first line of the function',
    )
  }
  if (!isSingleReturn(statement.thenStatement)) {
    ctx.report(statement, 'guard clause body must be a single return')
  }
}

export const guardClauseFirstLine: Rule = {
  name: 'guard-clause-first-line',
  applies: isProductionFile,
  enter(node, ctx) {
    const body = functionBody(node)
    if (body === undefined) return
    body.statements.forEach((statement, index) =>
      checkGuard(statement, index, ctx),
    )
  },
}
