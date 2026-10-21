import ts from 'typescript'
import { rootsAtThis } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Context, Rule } from '../engine/types.ts'

const isConstLocal = (statement: ts.Statement) =>
  ts.isVariableStatement(statement) &&
  (statement.declarationList.flags & ts.NodeFlags.Const) !== 0 &&
  statement.declarationList.declarations.length === 1

const isFieldAssignment = (statement: ts.Statement) =>
  ts.isExpressionStatement(statement) &&
  ts.isBinaryExpression(statement.expression) &&
  statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
  rootsAtThis(statement.expression.left)

const checkStatement = (statement: ts.Statement, ctx: Context) => {
  if (ctx.text(statement).includes('\n')) {
    ctx.report(
      statement,
      'constructors do no work; only single-line this.field = value assignments allowed',
    )
  } else if (!isConstLocal(statement) && !isFieldAssignment(statement)) {
    ctx.report(
      statement,
      'constructors do no work; only this.field = value assignments allowed',
    )
  }
}

const isThisCall = (node: ts.CallExpression) =>
  (ts.isPropertyAccessExpression(node.expression) ||
    ts.isElementAccessExpression(node.expression)) &&
  rootsAtThis(node.expression)

export const constructorAssignOnly: Rule = {
  name: 'constructor-assign-only',
  applies: isProductionFile,
  enter(node, ctx) {
    if (ts.isConstructorDeclaration(node) && node.body !== undefined) {
      node.body.statements.forEach((statement) =>
        checkStatement(statement, ctx),
      )
    } else if (
      ts.isCallExpression(node) &&
      ctx.ancestors.some(ts.isConstructorDeclaration) &&
      isThisCall(node)
    ) {
      ctx.report(
        node,
        'no this.*() calls in constructors; assign values directly',
      )
    }
  },
}
