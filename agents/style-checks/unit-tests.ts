const isTestFile = (fileName: string): boolean => {
  return /(^|\/)tests\/.*\.test\.ts$/.test(fileName)
}

const isInsideItCallback = (
  context: Deno.lint.RuleContext,
  node: Deno.lint.Node,
): boolean => {
  return context.sourceCode.getAncestors(node).some((ancestor) =>
    ancestor.type === 'CallExpression' &&
    ancestor.callee.type === 'Identifier' &&
    ancestor.callee.name === 'it'
  )
}

const countBlankLines = (text: string): number => {
  return text.split('\n').slice(1, -1).filter((line) => line.trim() === '')
    .length
}

const plugin: Deno.lint.Plugin = {
  name: 'crow-style-test',
  rules: {
    'one-top-level-describe': {
      create(context) {
        if (!isTestFile(context.filename)) return {}
        return {
          Program(node) {
            let describes = 0
            for (const statement of node.body) {
              if (
                statement.type === 'ExpressionStatement' &&
                statement.expression.type === 'CallExpression' &&
                statement.expression.callee.type === 'Identifier' &&
                statement.expression.callee.name === 'describe'
              ) {
                describes += 1
              }
            }
            if (describes !== 1) {
              context.report({
                node,
                message:
                  `tests must have exactly one top-level describe (found ${describes})`,
              })
            }
          },
        }
      },
    },
    'declarations-inside-it': {
      create(context) {
        if (!isTestFile(context.filename)) return {}
        const visitor = (node: Deno.lint.Node) => {
          if (isInsideItCallback(context, node)) return
          context.report({
            node,
            message: 'declarations must be inside it blocks',
          })
        }
        return {
          VariableDeclaration: visitor,
          FunctionDeclaration: visitor,
          ClassDeclaration: visitor,
        }
      },
    },
    'arrange-act-assert': {
      create(context) {
        if (!isTestFile(context.filename)) return {}
        return {
          CallExpression(node) {
            if (
              node.callee.type !== 'Identifier' ||
              node.callee.name !== 'it'
            ) return
            const callback = node.arguments[1]
            if (
              !callback ||
              (callback.type !== 'ArrowFunctionExpression' &&
                callback.type !== 'FunctionExpression')
            ) return
            if (callback.body.type !== 'BlockStatement') return
            if (callback.body.body.length === 0) return
            const blanks = countBlankLines(
              context.sourceCode.getText(callback.body),
            )
            if (blanks !== 2) {
              context.report({
                node,
                message:
                  `it block must have exactly three AAA sections (found ${blanks} blank lines)`,
              })
            }
          },
        }
      },
    },
  },
}

export default plugin
