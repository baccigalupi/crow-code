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

const isElement = (node: ts.Node): boolean => {
  if (ts.isParenthesizedExpression(node)) return isElement(node.expression)
  return ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)
}

const rendersElement = (node: ts.Expression) =>
  ts.isArrowFunction(node) &&
  node.parameters.length === 1 &&
  isElement(node.body)

// A list drawn as one element per item: `items.map((item) => <Row />)`. The
// element's own expressions are checked like any other.
const isElementList = (node: ts.Expression) =>
  ts.isCallExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  isValue(node.expression.expression) &&
  node.expression.name.text === 'map' &&
  node.arguments.length === 1 &&
  rendersElement(node.arguments[0])

const isContent = (child: ts.JsxChild) =>
  !ts.isJsxText(child) || !child.containsOnlyTriviaWhiteSpaces

const outside = (node: ts.Node): ts.Node => {
  if (ts.isParenthesizedExpression(node.parent)) return outside(node.parent)
  return node.parent
}

// The map is the only child of a fragment that is the whole concise body of
// the component: the component does only the mapping.
const isSoleMapping = (node: ts.JsxExpression) => {
  const root = node.parent
  if (!ts.isJsxFragment(root)) return false
  return (
    root.children.filter(isContent).length === 1 &&
    ts.isArrowFunction(outside(root))
  )
}

const generalMessage =
  'jsx expressions hold one attribute or one call; move the logic to the view model'

const mappingMessage =
  'map lists only in a component that does only the mapping, returning <>{rows.map(...)}</>'

const messageFor = (expression: ts.Expression) => {
  if (isElementList(expression)) return mappingMessage
  return generalMessage
}

export const jsxSingleExpression: Rule = {
  name: 'jsx-single-expression',
  applies: isTsxFile,
  enter(node, ctx) {
    if (!ts.isJsxExpression(node) || node.expression === undefined) return
    const expression = ctx.skipParentheses(node.expression) as ts.Expression
    if (isAttribute(expression) || isPlainCall(expression)) return
    if (isElementList(expression) && isSoleMapping(node)) return
    ctx.report(expression, messageFor(expression))
  },
}
