import ts from 'typescript'
import { isTsxFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

// Bound to `new ThingViewModel(...)` or its factory, `thingViewModel(...)`.
const buildsViewModel = (node: ts.VariableDeclaration) =>
  ts.isIdentifier(node.name) &&
  node.initializer !== undefined &&
  (ts.isNewExpression(node.initializer) ||
    ts.isCallExpression(node.initializer)) &&
  ts.isIdentifier(node.initializer.expression) &&
  node.initializer.expression.text.endsWith('ViewModel')

const isMisnamed = (node: ts.VariableDeclaration) =>
  buildsViewModel(node) && (node.name as ts.Identifier).text !== 'viewModel'

// The names bound to `new SomethingViewModel(...)` anywhere in the file.
const viewModelNames = (node: ts.Node, names: Set<string>): Set<string> => {
  if (ts.isVariableDeclaration(node) && buildsViewModel(node)) {
    names.add((node.name as ts.Identifier).text)
  }
  ts.forEachChild(node, (child) => {
    viewModelNames(child, names)
  })
  return names
}

const callsViewModel = (node: ts.CallExpression, file: ts.Node) =>
  ts.isPropertyAccessExpression(node.expression) &&
  ts.isIdentifier(node.expression.expression) &&
  viewModelNames(file, new Set()).has(node.expression.expression.text)

// A view model answers a question per method; a method that needs an
// argument to say which question is the component deciding, not the view
// model.
export const noViewModelArguments: Rule = {
  name: 'no-view-model-arguments',
  applies: isTsxFile,
  enter(node, ctx) {
    if (ts.isVariableDeclaration(node) && isMisnamed(node)) {
      ctx.report(
        node,
        'a component holds its view model as viewModel; name it viewModel',
      )
    }
    if (!ts.isCallExpression(node) || node.arguments.length === 0) return
    if (!callsViewModel(node, ctx.ancestors[0])) return
    ctx.report(
      node,
      'view model methods take no arguments; give each value its own method',
    )
  },
}
