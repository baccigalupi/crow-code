const isProductionFile = (fileName: string): boolean => {
  return /(^|\/)src\/.*\.ts$/.test(fileName) && !fileName.endsWith('.test.ts')
}

const isTestFile = (fileName: string): boolean =>
  /(^|\/)tests\/.*\.test\.ts$/.test(fileName)

const functionLikeAncestorTypes = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'MethodDefinition',
])

const isInsideFunctionLike = (
  context: Deno.lint.RuleContext,
  node: Deno.lint.Node,
): boolean => {
  return context.sourceCode.getAncestors(node).some((ancestor) =>
    functionLikeAncestorTypes.has(ancestor.type)
  )
}

const topLevelParents = new Set([
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
])

const isTopLevel = (
  context: Deno.lint.RuleContext,
  node: Deno.lint.Node,
): boolean => {
  const ancestors = context.sourceCode.getAncestors(node)
  if (ancestors.length === 0) return false
  if (ancestors.length === 1) return ancestors[0].type === 'Program'
  return ancestors.length === 2 && ancestors[0].type === 'Program' &&
    topLevelParents.has(ancestors[1].type)
}

const bodyLineCount = (text: string): number => {
  const lines = text.split('\n').slice(1, -1)
  return lines.filter((line) => line.trim() !== '').length
}

const fileLineCount = (text: string): number => {
  const lines = text.split('\n').length
  return text.endsWith('\n') ? lines - 1 : lines
}

const discriminantText = (
  context: Deno.lint.RuleContext,
  node: Deno.lint.IfStatement,
): string | null => {
  const test = node.test
  if (test.type !== 'BinaryExpression') return null
  if (!['===', '==', '!==', '!='].includes(test.operator)) return null
  if (
    test.left.type === 'Identifier' ||
    test.left.type === 'MemberExpression'
  ) {
    return context.sourceCode.getText(test.left)
  }
  return null
}

const containsReturn = (node: Deno.lint.Statement): boolean => {
  if (node.type === 'ReturnStatement') return true
  if (node.type === 'BlockStatement') {
    return node.body.some((statement) => containsReturn(statement))
  }
  return false
}

const singleReturn = (
  node: Deno.lint.Statement,
): Deno.lint.ReturnStatement | null => {
  if (node.type === 'ReturnStatement') return node
  if (
    node.type === 'BlockStatement' &&
    node.body.length === 1 &&
    node.body[0].type === 'ReturnStatement'
  ) return node.body[0]
  return null
}

const plugin: Deno.lint.Plugin = {
  name: 'crow-style-code',
  rules: {
    'no-module-function-declaration': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          FunctionDeclaration(node) {
            if (isTopLevel(context, node)) {
              context.report({
                node,
                message:
                  'module-level functions must be const arrows, not function declarations',
              })
            }
          },
        }
      },
    },
    'no-parameter-properties': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          TSParameterProperty(node) {
            context.report({
              node,
              message:
                'constructors must use explicit typed attributes, no parameter properties',
            })
          },
        }
      },
    },
    'no-static': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          ':matches(MethodDefinition, PropertyDefinition)'(node) {
            const member = node as unknown as { static?: boolean }
            if (!member.static) return
            context.report({
              node,
              message:
                'no static members; use module-level consts or instance fields',
            })
          },
          StaticBlock(node) {
            context.report({
              node,
              message: 'no static blocks; initialize at module level',
            })
          },
        }
      },
    },
    'no-super': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          Super(node) {
            context.report({
              node,
              message:
                'no super; subclass field initializers run after super() and clobber inherited constructor state',
            })
          },
        }
      },
    },
    'no-ternary': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          ConditionalExpression(node) {
            context.report({
              node,
              message: 'conditionals must be flat; no ternary operator (?:)',
            })
          },
        }
      },
    },
    'no-nullish-coalescing': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          LogicalExpression(node) {
            if (node.operator === '??') {
              context.report({
                node,
                message: 'no ?? operator; write explicit if/early return',
              })
            }
          },
        }
      },
    },
    'no-optional-chaining': {
      create(context) {
        if (
          !isProductionFile(context.filename) && !isTestFile(context.filename)
        ) return {}
        return {
          MemberExpression(node) {
            if (node.optional) {
              context.report({
                node,
                message: 'no ?. operator; write explicit null checks',
              })
            }
          },
          CallExpression(node) {
            if (node.optional) {
              context.report({
                node,
                message: 'no ?. operator; write explicit null checks',
              })
            }
          },
        }
      },
    },
    'no-throw': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          ThrowStatement(node) {
            context.report({
              node,
              message: 'no throws unless user asked or approved',
            })
          },
        }
      },
    },
    'no-for-loops': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          ForStatement(node) {
            context.report({
              node,
              message: 'collections use iterators; no for loops',
            })
          },
          ForInStatement(node) {
            context.report({
              node,
              message: 'collections use iterators; no for-in loops',
            })
          },
          ForOfStatement(node) {
            context.report({
              node,
              message: 'collections use iterators; no for-of loops',
            })
          },
        }
      },
    },
    'while-only-infinite': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          WhileStatement(node) {
            const test = node.test
            if (test.type !== 'Literal' || test.value !== true) {
              context.report({
                node,
                message: 'while only allowed for infinite loops',
              })
            }
          },
        }
      },
    },
    'no-re-exports': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          ExportNamedDeclaration(node) {
            if (node.source) {
              context.report({
                node,
                message:
                  'do not re-export from feature modules; consumers import directly',
              })
            }
          },
          ExportAllDeclaration(node) {
            context.report({
              node,
              message:
                'do not re-export all from feature modules; consumers import directly',
            })
          },
        }
      },
    },
    'types-only-in-types-files': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        if (context.filename.endsWith('/types.ts')) return {}
        return {
          ExportNamedDeclaration(node) {
            if (node.exportKind === 'type') {
              context.report({
                node,
                message: 'type exports are only allowed in types.ts files',
              })
              return
            }
            const declaration = node.declaration
            if (
              declaration &&
              (
                declaration.type === 'TSTypeAliasDeclaration' ||
                declaration.type === 'TSInterfaceDeclaration' ||
                declaration.type === 'TSEnumDeclaration' ||
                declaration.type === 'TSModuleDeclaration'
              )
            ) {
              context.report({
                node,
                message:
                  'type/interface/enum exports are only allowed in types.ts files',
              })
            }
          },
        }
      },
    },
    'no-screaming-case': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          VariableDeclaration(node) {
            if (!isTopLevel(context, node)) return
            for (const declaration of node.declarations) {
              if (
                declaration.id.type === 'Identifier' &&
                /^[A-Z][A-Z0-9_]*$/.test(declaration.id.name)
              ) {
                context.report({
                  node: declaration.id,
                  message: 'no SCREAMING_CASE names; use camelCase',
                })
              }
            }
          },
        }
      },
    },
    'max-function-lines': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'(
            node,
          ) {
            const bodyNode =
              (node as unknown as Record<string, unknown>).body ??
                ((node as unknown as Record<string, unknown>).value as
                  | Record<string, unknown>
                  | undefined)?.body
            if (
              !bodyNode ||
              (bodyNode as Deno.lint.Node).type !== 'BlockStatement'
            ) return
            const bodyText = context.sourceCode.getText(
              bodyNode as Deno.lint.Node,
            )
            const lines = bodyLineCount(bodyText)
            if (lines > 7) {
              context.report({
                node,
                message: `function/method body is ${lines} lines; must be ≤ 7`,
              })
            }
          },
        }
      },
    },
    'no-nested-function-declarations': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          FunctionDeclaration(node) {
            if (isInsideFunctionLike(context, node)) {
              context.report({
                node,
                message:
                  'no nested function declarations; use an arrow function or callback',
              })
            }
          },
        }
      },
    },
    'chained-conditionals': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          BlockStatement(node) {
            let runStart = -1
            let runDiscriminant: string | null = null
            for (let i = 0; i < node.body.length; i++) {
              const statement = node.body[i]
              if (
                statement.type === 'IfStatement' && !statement.alternate
              ) {
                const discriminant = discriminantText(context, statement)
                if (discriminant === null) {
                  runStart = -1
                  runDiscriminant = null
                  continue
                }
                if (discriminant !== runDiscriminant) {
                  runStart = i
                  runDiscriminant = discriminant
                  continue
                }
                if (i - runStart + 1 >= 3) {
                  context.report({
                    node: node.body[runStart],
                    message:
                      'mutually exclusive branches must use if/else if/else, not consecutive ifs',
                  })
                  runStart = -1
                  runDiscriminant = null
                }
              } else {
                runStart = -1
                runDiscriminant = null
              }
            }
          },
        }
      },
    },
    'guard-clause-first-line': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        return {
          ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, MethodDefinition)'(
            node,
          ) {
            if (node.type === 'FunctionExpression') {
              const ancestors = context.sourceCode.getAncestors(node)
              const parent = ancestors[ancestors.length - 1]
              if (parent?.type === 'MethodDefinition') return
            }
            const bodyNode =
              (node as unknown as Record<string, unknown>).body ??
                ((node as unknown as Record<string, unknown>).value as
                  | Record<string, unknown>
                  | undefined)?.body
            if (
              !bodyNode ||
              (bodyNode as Deno.lint.Node).type !== 'BlockStatement'
            ) return
            const body = (bodyNode as Deno.lint.BlockStatement).body
            for (let i = 0; i < body.length; i++) {
              const statement = body[i]
              if (
                statement.type === 'IfStatement' &&
                statement.alternate === null &&
                containsReturn(statement.consequent)
              ) {
                if (i > 0) {
                  context.report({
                    node: statement,
                    message:
                      'guard clauses must be on the first line of the function',
                  })
                }
                const guardReturn = singleReturn(statement.consequent)
                if (!guardReturn) {
                  context.report({
                    node: statement,
                    message: 'guard clause body must be a single return',
                  })
                }
              }
            }
          },
        }
      },
    },
    'max-file-lines': {
      create(context) {
        if (!isProductionFile(context.filename)) return {}
        if (context.filename.endsWith('/types.ts')) return {}
        return {
          Program(node) {
            const lines = fileLineCount(context.sourceCode.getText())
            if (lines > 100) {
              context.report({
                node,
                message: `file exceeds 100 lines`,
              })
            }
          },
        }
      },
    },
  },
}

export default plugin
