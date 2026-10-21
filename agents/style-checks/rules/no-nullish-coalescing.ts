import ts from 'typescript'
import {
  isProductionFile,
  isTestFile,
  isTestSupportFile,
} from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

export const noNullishCoalescing: Rule = {
  name: 'no-nullish-coalescing',
  applies: (fileName) =>
    isProductionFile(fileName) ||
    isTestFile(fileName) ||
    isTestSupportFile(fileName),
  enter(node, ctx) {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
    ) {
      ctx.report(node, 'no ?? operator; write explicit if/early return')
    }
  },
}
