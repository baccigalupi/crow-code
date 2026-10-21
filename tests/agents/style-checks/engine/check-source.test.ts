import { describe, expect, it } from 'bun:test'
import ts from 'typescript'
import { checkSource } from '../../../../agents/style-checks/engine/check-source.ts'
import type { Plugin } from '../../../../agents/style-checks/engine/types.ts'

describe('checkSource', () => {
  it('when the source is empty, returns no diagnostics', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isStatement(node)) ctx.report(node, 'found')
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', '')

    expect(diagnostics).toEqual([])
  })

  it('when a rule reports on a variable declaration, returns one diagnostic', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isVariableDeclaration(node)) ctx.report(node, 'found')
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', 'const x = 1')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'found', line: 1, column: 7 },
    ])
  })

  it('when a rule does not apply to the filename, returns no diagnostics', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => false,
          enter(node, ctx) {
            ctx.report(node, 'found')
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', 'const x = 1')

    expect(diagnostics).toEqual([])
  })

  it('when a rule enters a numeric literal, sees its ancestors', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isNumericLiteral(node)) {
              ctx.report(ctx.ancestors[1], 'statement')
              ctx.report(ctx.ancestors[3], 'declaration')
            }
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', 'const x = 1')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'statement', line: 1, column: 1 },
      { rule: 'p/r', message: 'declaration', line: 1, column: 7 },
    ])
  })

  it('when a rule exits a numeric literal, sees the same ancestors', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          exit(node, ctx) {
            if (ts.isNumericLiteral(node)) {
              ctx.report(ctx.ancestors[1], 'statement')
              ctx.report(ctx.ancestors[3], 'declaration')
            }
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', 'const x = 1')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'statement', line: 1, column: 1 },
      { rule: 'p/r', message: 'declaration', line: 1, column: 7 },
    ])
  })

  it('when two rules enter and exit statements, diagnostics follow traversal order', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r1',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isExpressionStatement(node)) ctx.report(node, 'r1 enter')
          },
          exit(node, ctx) {
            if (ts.isExpressionStatement(node)) ctx.report(node, 'r1 exit')
          },
        },
        {
          name: 'r2',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isExpressionStatement(node)) ctx.report(node, 'r2 enter')
          },
          exit(node, ctx) {
            if (ts.isExpressionStatement(node)) ctx.report(node, 'r2 exit')
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', 'a; b')

    expect(diagnostics).toEqual([
      { rule: 'p/r1', message: 'r1 enter', line: 1, column: 1 },
      { rule: 'p/r2', message: 'r2 enter', line: 1, column: 1 },
      { rule: 'p/r1', message: 'r1 exit', line: 1, column: 1 },
      { rule: 'p/r2', message: 'r2 exit', line: 1, column: 1 },
      { rule: 'p/r1', message: 'r1 enter', line: 1, column: 4 },
      { rule: 'p/r2', message: 'r2 enter', line: 1, column: 4 },
      { rule: 'p/r1', message: 'r1 exit', line: 1, column: 4 },
      { rule: 'p/r2', message: 'r2 exit', line: 1, column: 4 },
    ])
  })

  it('when text is read for a commented statement, excludes the comment', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isVariableStatement(node)) ctx.report(node, ctx.text(node))
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', '// c\nconst x = 1')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'const x = 1', line: 2, column: 1 },
    ])
  })

  it('when a rule reports on a statement on line three, diagnostic has line 3 and column 1', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isVariableStatement(node)) ctx.report(node, 'found')
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', '\n\nconst x = 1')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'found', line: 3, column: 1 },
    ])
  })

  it('when lineOf is given a position on line two, returns 2', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isIdentifier(node)) {
              ctx.report(node, `line ${ctx.lineOf(node.getStart())}`)
            }
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', '\nconst x = 1')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'line 2', line: 2, column: 7 },
    ])
  })

  it('when an initializer is parenthesized twice, returns the inner identifier', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isVariableDeclaration(node) && node.initializer) {
              const inner = ctx.skipParentheses(node.initializer)
              ctx.report(inner, ctx.text(inner))
            }
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', 'const y = ((x))')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'x', line: 1, column: 13 },
    ])
  })

  it('when a node is not parenthesized, skipParentheses returns it unchanged', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isVariableDeclaration(node) && node.initializer) {
              ctx.report(ctx.skipParentheses(node.initializer), 'same')
            }
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/a.ts', 'const y = x')

    expect(diagnostics).toEqual([
      { rule: 'p/r', message: 'same', line: 1, column: 11 },
    ])
  })

  it('when the filename is tsx, parses JSX', () => {
    const plugin: Plugin = {
      name: 'p',
      rules: [
        {
          name: 'r',
          applies: () => true,
          enter(node, ctx) {
            if (ts.isJsxSelfClosingElement(node)) ctx.report(node, 'jsx')
          },
        },
      ],
    }

    const diagnostics = checkSource(plugin, 'src/view.tsx', 'const v = <div />')

    expect(diagnostics).toHaveLength(1)
  })
})
