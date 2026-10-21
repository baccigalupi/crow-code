import ts from 'typescript'
import type { Context } from './types.ts'

type FunctionLike =
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration
  | ts.ConstructorDeclaration
  | ts.AccessorDeclaration

export const isFunctionLike = (node: ts.Node): node is FunctionLike =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isArrowFunction(node) ||
  ts.isMethodDeclaration(node) ||
  ts.isConstructorDeclaration(node) ||
  ts.isGetAccessorDeclaration(node) ||
  ts.isSetAccessorDeclaration(node)

export const functionBody = (node: ts.Node) => {
  if (!isFunctionLike(node)) return
  if (node.body === undefined || !ts.isBlock(node.body)) return
  return node.body
}

export const isTopLevel = (ctx: Context) => {
  const parent = ctx.ancestors[ctx.ancestors.length - 1]
  return parent !== undefined && ts.isSourceFile(parent)
}

export const modifierKinds = (node: ts.Node) => {
  if (!ts.canHaveModifiers(node)) return []
  const modifiers = ts.getModifiers(node)
  if (modifiers === undefined) return []
  return modifiers.map((modifier) => modifier.kind)
}

export const rootsAtThis = (node: ts.Node) => {
  let current = node
  while (
    ts.isPropertyAccessExpression(current) ||
    ts.isElementAccessExpression(current)
  ) {
    current = current.expression
  }
  return current.kind === ts.SyntaxKind.ThisKeyword
}

export const isDelegateDecorator = (decorator: ts.Decorator) => {
  let target = decorator.expression
  if (ts.isCallExpression(target)) target = target.expression
  return ts.isIdentifier(target) && target.text === 'delegate'
}

export const delegateDecorators = (node: ts.Node) => {
  if (!ts.canHaveDecorators(node)) return []
  const decorators = ts.getDecorators(node)
  if (decorators === undefined) return []
  return decorators.filter(isDelegateDecorator)
}
