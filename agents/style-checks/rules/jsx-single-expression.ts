import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const valueKinds = new Set([
  ts.SyntaxKind.Identifier,
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.ThisKeyword,
])

const isValue = (node: ts.Expression) => valueKinds.has(node.kind)

// A value, or one attribute reached from it: `name`, `view.width`,
// `fields[name]`. Never two deep, like `theme.panel.background`.
const isAttribute = (node: ts.Expression) => {
  if (isValue(node)) return true
  if (ts.isPropertyAccessExpression(node)) return isValue(node.expression)
  return (
    ts.isElementAccessExpression(node) &&
    isValue(node.expression) &&
    isValue(node.argumentExpression)
  )
}

// One call on an attribute, every argument an attribute.
const isPlainCall = (node: ts.Expression) =>
  ts.isCallExpression(node) &&
  isAttribute(node.expression) &&
  node.arguments.every(isAttribute)

export const jsxSingleExpression: Rule = {
  name: 'jsx-single-expression',
  applies: isTsxFile,
  enter(node, ctx) {
    if (!ts.isJsxExpression(node) || node.expression === undefined) return
    const expression = ctx.skipParentheses(node.expression) as ts.Expression
    if (isAttribute(expression) || isPlainCall(expression)) return
    ctx.report(
      expression,
      'jsx expressions hold one attribute or one call; move the logic to the view model',
    )
  },
}
