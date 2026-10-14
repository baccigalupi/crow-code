const isInstallFile = (fileName: string): boolean =>
  /(^|\/)(src|tests)\/tui\/install\/.*\.tsx?$/.test(fileName)

const fullNames: Record<string, string> = {
  repo: 'repoDirectory',
  user: 'globalDirectory',
  env: 'envFile',
}

const report = (
  context: Deno.lint.RuleContext,
  node: Deno.lint.Node,
  name: string,
) => {
  if (!Object.hasOwn(fullNames, name)) return
  context.report({
    node,
    message: `install inputs are named ${fullNames[name]}, not ${name}`,
  })
}

const plugin: Deno.lint.Plugin = {
  name: 'crow-style-install',
  rules: {
    'full-input-names': {
      create(context) {
        if (!isInstallFile(context.filename)) return {}
        return {
          Identifier(node) {
            report(context, node, node.name)
          },
          JSXIdentifier(node) {
            report(context, node, node.name)
          },
        }
      },
    },
  },
}

export default plugin
