import ts from 'typescript'
import { modifierKinds } from '../engine/ast.ts'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const hasInlineTypeLiteral = (arrow: ts.ArrowFunction) => {
  const parameter = arrow.parameters[0]
  if (parameter === undefined) return false
  if (!ts.isObjectBindingPattern(parameter.name)) return false
  return parameter.type !== undefined && ts.isTypeLiteralNode(parameter.type)
}

export const noInlinePropsType: Rule = {
  name: 'no-inline-props-type',
  applies: isTsxFile,
  enter(node, ctx) {
    if (!ts.isVariableStatement(node)) return
    if (!modifierKinds(node).includes(ts.SyntaxKind.ExportKeyword)) return
    node.declarationList.declarations.forEach((declaration) => {
      const initializer = declaration.initializer
      if (initializer === undefined) return
      if (!ts.isArrowFunction(initializer)) return
      if (!hasInlineTypeLiteral(initializer)) return
      ctx.report(
        initializer,
        'exported components take a named props type declared above the function, not an inline object type',
      )
    })
  },
}
