import ts from 'typescript'
import type { Context, Diagnostic, Rule } from './types.ts'

const skipParentheses = (node: ts.Node) => {
  let current = node
  while (ts.isParenthesizedExpression(current)) current = current.expression
  return current
}

export const walk = (
  sourceFile: ts.SourceFile,
  pluginName: string,
  rules: Rule[],
) => {
  const diagnostics: Diagnostic[] = []
  const ancestors: ts.Node[] = []
  let currentRule = rules[0]

  const lineOf = (position: number) =>
    sourceFile.getLineAndCharacterOfPosition(position).line + 1

  const context: Context = {
    ancestors,
    text: (node) => node.getText(sourceFile),
    lineOf,
    report: (node, message) => {
      const start = node.getStart(sourceFile)
      const { line, character } =
        sourceFile.getLineAndCharacterOfPosition(start)
      diagnostics.push({
        rule: `${pluginName}/${currentRule.name}`,
        message,
        line: line + 1,
        column: character + 1,
      })
    },
    skipParentheses,
  }

  const visit = (node: ts.Node) => {
    rules.forEach((rule) => {
      currentRule = rule
      if (rule.enter) rule.enter(node, context)
    })
    ancestors.push(node)
    ts.forEachChild(node, (child) => {
      visit(child)
    })
    ancestors.pop()
    rules.forEach((rule) => {
      currentRule = rule
      if (rule.exit) rule.exit(node, context)
    })
  }

  visit(sourceFile)
  return diagnostics
}
