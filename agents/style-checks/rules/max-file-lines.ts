import ts from 'typescript'
import { delegateDecorators } from '../engine/ast.ts'
import { isAnySourceFile } from '../engine/gates.ts'
import type { Context, Rule } from '../engine/types.ts'

const fileLineCount = (text: string) => {
  const lines = text.split('\n').length
  if (text.endsWith('\n')) return lines - 1
  return lines
}

const ownDelegateLines = (node: ts.Node, ctx: Context) => {
  if (!ts.isClassDeclaration(node) && !ts.isClassExpression(node)) return 0
  return delegateDecorators(node).reduce(
    (lines, decorator) => lines + ctx.text(decorator).split('\n').length,
    0,
  )
}

const delegateLines = (node: ts.Node, ctx: Context): number => {
  let lines = ownDelegateLines(node, ctx)
  ts.forEachChild(node, (child) => {
    lines += delegateLines(child, ctx)
  })
  return lines
}

export const maxFileLines: Rule = {
  name: 'max-file-lines',
  applies: (fileName) =>
    isAnySourceFile(fileName) && !fileName.endsWith('/types.ts'),
  exit(node, ctx) {
    if (!ts.isSourceFile(node)) return
    if (fileLineCount(node.text) - delegateLines(node, ctx) > 100) {
      ctx.report(node, 'file exceeds 100 lines')
    }
  },
}
