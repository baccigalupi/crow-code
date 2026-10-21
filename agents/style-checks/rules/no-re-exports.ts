import ts from 'typescript'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const isNamed = (node: ts.ExportDeclaration) =>
  node.exportClause !== undefined && ts.isNamedExports(node.exportClause)

export const noReExports: Rule = {
  name: 'no-re-exports',
  applies: isProductionFile,
  enter(node, ctx) {
    if (!ts.isExportDeclaration(node) || node.moduleSpecifier === undefined)
      return
    if (isNamed(node)) {
      ctx.report(
        node,
        'do not re-export from feature modules; consumers import directly',
      )
    } else {
      ctx.report(
        node,
        'do not re-export all from feature modules; consumers import directly',
      )
    }
  },
}
