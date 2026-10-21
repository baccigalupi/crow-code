import ts from 'typescript'
import { isProductionFile, isTestFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const hasOwnQuestionDot = (node: ts.Node) =>
  (ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node) ||
    ts.isCallExpression(node)) &&
  node.questionDotToken !== undefined

export const noOptionalChaining: Rule = {
  name: 'no-optional-chaining',
  applies: (fileName) => isProductionFile(fileName) || isTestFile(fileName),
  enter(node, ctx) {
    if (hasOwnQuestionDot(node)) {
      ctx.report(node, 'no ?. operator; write explicit null checks')
    }
  },
}
