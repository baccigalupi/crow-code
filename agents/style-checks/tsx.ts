const isTsxFile = (fileName: string): boolean =>
  /(^|\/)src\/.*\.tsx$/.test(fileName) && !fileName.endsWith('.test.tsx')

const isHooksFile = (fileName: string): boolean =>
  /(^|\/)hooks\//.test(fileName)

const reactStateHooks = new Set(['useState', 'useReducer'])

const isReactStateCallee = (node: Deno.lint.Node): boolean => {
  if (node.type !== 'Identifier') return false
  return reactStateHooks.has(node.name)
}

const isHookOrViewModel = (name: string): boolean =>
  /^use[A-Z]/.test(name) || name.endsWith('ViewModel')

const isAllowedViewCall = (callee: Deno.lint.Node): boolean => {
  if (callee.type === 'Identifier') return isHookOrViewModel(callee.name)
  if (callee.type !== 'MemberExpression') return false
  return callee.property.type === 'Identifier' && callee.property.name === 'map'
}

const hasInlineTypeLiteral = (
  parameter: Deno.lint.Parameter | undefined,
): boolean => {
  if (parameter?.type !== 'ObjectPattern') return false
  return parameter.typeAnnotation?.typeAnnotation.type === 'TSTypeLiteral'
}

const plugin: Deno.lint.Plugin = {
  name: 'crow-style-tsx',
  rules: {
    'arrow-function-components': {
      create(context) {
        if (!isTsxFile(context.filename)) return {}
        return {
          FunctionDeclaration(node) {
            context.report({
              node,
              message:
                'tsx components must be const arrows, not function declarations',
            })
          },
        }
      },
    },
    'no-react-state': {
      create(context) {
        if (!isTsxFile(context.filename)) return {}
        return {
          ImportSpecifier(node) {
            const imported = node.imported
            if (
              imported.type === 'Identifier' &&
              reactStateHooks.has(imported.name)
            ) {
              context.report({
                node,
                message:
                  'react state hooks are banned; state is @preact/signals-core signals',
              })
            }
          },
          CallExpression(node) {
            if (isReactStateCallee(node.callee)) {
              context.report({
                node,
                message:
                  'react state hooks are banned; state is @preact/signals-core signals',
              })
            }
          },
        }
      },
    },
    'no-inline-use-input': {
      create(context) {
        if (!isTsxFile(context.filename)) return {}
        if (isHooksFile(context.filename)) return {}
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'Identifier' &&
              node.callee.name === 'useInput'
            ) {
              context.report({
                node,
                message:
                  'input handling lives in dedicated hooks/, not inline useInput in a view',
              })
            }
          },
        }
      },
    },
    'views-only-call-view-models': {
      create(context) {
        if (!isTsxFile(context.filename)) return {}
        return {
          CallExpression(node) {
            if (isAllowedViewCall(node.callee)) return
            context.report({
              node,
              message:
                'views may only call hooks (use*), view models (*ViewModel), and .map in JSX; derivation belongs in a view model',
            })
          },
        }
      },
    },
    'no-inline-props-type': {
      create(context) {
        if (!isTsxFile(context.filename)) return {}
        return {
          ExportNamedDeclaration(node) {
            const declaration = node.declaration
            if (declaration?.type !== 'VariableDeclaration') return
            for (const declarator of declaration.declarations) {
              if (declarator.init?.type !== 'ArrowFunctionExpression') continue
              if (!hasInlineTypeLiteral(declarator.init.params[0])) continue
              context.report({
                node: declarator.init,
                message:
                  'exported components take a named props type declared above the function, not an inline object type',
              })
            }
          },
        }
      },
    },
    'no-jsx-logical-and': {
      create(context) {
        if (!isTsxFile(context.filename)) return {}
        return {
          JSXExpressionContainer(node) {
            const expression = node.expression
            if (
              expression.type === 'LogicalExpression' &&
              expression.operator === '&&'
            ) {
              context.report({
                node: expression,
                message:
                  'no && conditionals in JSX; use a helper component with early return null',
              })
            }
          },
        }
      },
    },
  },
}

export default plugin
