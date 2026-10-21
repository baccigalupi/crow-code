import ts from 'typescript'
import { isNamedCall } from '../engine/ast.ts'
import { isTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const isDeclaration = (node: ts.Node) =>
  ts.isVariableDeclarationList(node) ||
  ts.isFunctionDeclaration(node) ||
  ts.isClassDeclaration(node)

export const declarationsInsideIt: Rule = {
  name: 'declarations-inside-it',
  applies: isTestFile,
  enter(node, ctx) {
    if (!isDeclaration(node)) return
    if (ctx.ancestors.some((ancestor) => isNamedCall(ancestor, 'it'))) return
    ctx.report(node, 'declarations must be inside it blocks')
  },
}
