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

const countBlankLinesBetweenStatements = (
  text: string,
  statements: Deno.lint.Statement[],
): number => {
  return statements.slice(1).reduce((total, statement, index) => {
    const previous = statements[index]
    const gap = text.slice(previous.range[1], statement.range[0])
    return total + countBlankLines(gap)
  }, 0)
}

const isExpectCall = (node: Deno.lint.Node): boolean => {
  return node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'expect'
}

const isLoopStatement = (node: Deno.lint.Node): boolean => {
  return node.type === 'ForStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement' ||
    node.type === 'WhileStatement' ||
    node.type === 'DoWhileStatement'
}

const isNamedCall = (node: Deno.lint.Node, name: string): boolean => {
  return node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === name
}

const countDirectTests = (callback: Deno.lint.Node): number => {
  if (
    callback.type !== 'ArrowFunctionExpression' &&
    callback.type !== 'FunctionExpression'
  ) return 0
  if (callback.body.type !== 'BlockStatement') return 0
  return callback.body.body.filter((statement) =>
    statement.type === 'ExpressionStatement' &&
    isNamedCall(statement.expression, 'it')
  ).length
}

const minimumNestedTests = 3

const collectionMethods = new Set([
  'map',
  'filter',
  'some',
  'every',
  'find',
  'findIndex',
  'reduce',
  'flatMap',
  'forEach',
  'sort',
])

const isCollectionMethodCall = (node: Deno.lint.Node): boolean => {
  if (node.type !== 'CallExpression') return false
  const callee = node.callee
  if (callee.type !== 'MemberExpression') return false
  if (callee.computed) return false
  return callee.property.type === 'Identifier' &&
    collectionMethods.has(callee.property.name)
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
            const blanks = countBlankLinesBetweenStatements(
              context.sourceCode.text,
              callback.body.body,
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
    'nested-describe-minimum': {
      create(context) {
        if (!isTestFile(context.filename)) return {}
        return {
          CallExpression(node) {
            if (!isNamedCall(node, 'describe')) return
            const nested = context.sourceCode.getAncestors(node).some(
              (ancestor) => isNamedCall(ancestor, 'describe'),
            )
            if (!nested) return
            const tests = countDirectTests(node.arguments[1])
            if (tests >= minimumNestedTests) return
            context.report({
              node,
              message:
                `nested describe needs at least three tests (found ${tests})`,
            })
          },
        }
      },
    },
    'no-temporary-directories': {
      create(context) {
        if (!isTestFile(context.filename)) return {}
        return {
          CallExpression(node) {
            const callee = node.callee
            if (
              callee.type === 'MemberExpression' &&
              callee.object.type === 'Identifier' &&
              callee.object.name === 'Deno' &&
              callee.property.type === 'Identifier' &&
              (callee.property.name === 'makeTempDir' ||
                callee.property.name === 'makeTempDirSync')
            ) {
              context.report({
                node,
                message:
                  'no temporary directories in tests; use fixed fixture paths under tests/support/fixtures',
              })
            }
          },
        }
      },
    },
    'no-logic-in-tests': {
      create(context) {
        if (!isTestFile(context.filename)) return {}
        return {
          CallExpression(node) {
            if (!isInsideItCallback(context, node)) return
            if (isCollectionMethodCall(node)) {
              context.report({
                node,
                message: 'no logic in tests: assert directly on the result',
              })
              return
            }
            if (!isExpectCall(node)) return
            const insideLoop = context.sourceCode.getAncestors(node).some(
              (ancestor) => isLoopStatement(ancestor),
            )
            if (!insideLoop) return
            context.report({
              node,
              message:
                'expect must not be inside a loop: assert each element explicitly',
            })
          },
        }
      },
    },
  },
}

export default plugin
