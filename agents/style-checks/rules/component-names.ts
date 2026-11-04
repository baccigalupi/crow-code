import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Context, Rule } from '../engine/types.ts'

// Capitalized globals that are plain conversion functions, not components.
const builtins = new Set(['String', 'Number', 'Boolean', 'BigInt', 'Symbol'])

const isJsx = (node: ts.Node) =>
  ts.isJsxElement(node) ||
  ts.isJsxSelfClosingElement(node) ||
  ts.isJsxFragment(node)

const returnsJsx = (statement: ts.Statement, ctx: Context) =>
  ts.isReturnStatement(statement) &&
  statement.expression !== undefined &&
  isJsx(ctx.skipParentheses(statement.expression))

const bodyIsJsx = (body: ts.ConciseBody, ctx: Context) => {
  if (ts.isBlock(body)) return body.statements.some((s) => returnsJsx(s, ctx))
  return isJsx(ctx.skipParentheses(body))
}

const isLowercaseRenderer = (node: ts.VariableDeclaration, ctx: Context) =>
  ts.isIdentifier(node.name) &&
  /^[a-z]/.test(node.name.text) &&
  node.initializer !== undefined &&
  ts.isArrowFunction(node.initializer) &&
  bodyIsJsx(node.initializer.body, ctx)

const isComponentName = (node: ts.Node) =>
  ts.isIdentifier(node) && /^[A-Z]/.test(node.text) && !builtins.has(node.text)

const callsComponent = (node: ts.CallExpression) =>
  isComponentName(node.expression) || node.arguments.some(isComponentName)

// A function that returns jsx is a component: it is capitalized and only ever
// rendered as `<Name />`, never called or handed to `map` as a function.
export const componentNames: Rule = {
  name: 'component-names',
  applies: isTsxFile,
  enter(node, ctx) {
    if (ts.isVariableDeclaration(node) && isLowercaseRenderer(node, ctx)) {
      ctx.report(
        node,
        'functions returning jsx are components; capitalize the name and render it as <Name />',
      )
    } else if (ts.isCallExpression(node) && callsComponent(node)) {
      ctx.report(
        node,
        'render components as <Name />; never call them or pass them as functions',
      )
    }
  },
}
