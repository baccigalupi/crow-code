import ts from 'typescript'
import { delegateDecorators, modifierKinds } from '../engine/ast.ts'
import { isProductionFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const isExportedTypeDeclaration = (node: ts.Node) =>
  (ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isEnumDeclaration(node) ||
    ts.isModuleDeclaration(node)) &&
  modifierKinds(node).includes(ts.SyntaxKind.ExportKeyword)

const isDelegateClassNamed = (statement: ts.Statement, name: string) =>
  ts.isClassDeclaration(statement) &&
  statement.name !== undefined &&
  statement.name.text === name &&
  delegateDecorators(statement).length > 0

const isDelegatedInterface = (node: ts.Node, root: ts.Node) =>
  ts.isInterfaceDeclaration(node) &&
  ts.isSourceFile(root) &&
  root.statements.some((statement) =>
    isDelegateClassNamed(statement, node.name.text),
  )

export const typesOnlyInTypesFiles: Rule = {
  name: 'types-only-in-types-files',
  applies: (fileName) =>
    isProductionFile(fileName) && !fileName.endsWith('/types.ts'),
  enter(node, ctx) {
    const isTypeExport =
      isExportedTypeDeclaration(node) ||
      (ts.isExportDeclaration(node) && node.isTypeOnly)
    if (isTypeExport && !isDelegatedInterface(node, ctx.ancestors[0])) {
      ctx.report(node, 'type exports are only allowed in types.ts files')
    }
  },
}
