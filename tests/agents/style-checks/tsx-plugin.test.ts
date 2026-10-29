import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../agents/style-checks/engine/check-source.ts'
import { tsxPlugin } from '../../../agents/style-checks/tsx-plugin.ts'

describe('tsxPlugin', () => {
  it('when the plugin is built, lists the four rules in order', () => {
    const plugin = tsxPlugin

    const rules = plugin.rules

    expect(plugin.name).toBe('crow-style-tsx')
    expect(rules).toHaveLength(4)
    expect(rules[0].name).toBe('arrow-function-components')
    expect(rules[1].name).toBe('no-react-state')
    expect(rules[2].name).toBe('no-inline-props-type')
    expect(rules[3].name).toBe('no-jsx-logical-and')
  })

  it('when a tsx file uses a function declaration, reports it', () => {
    const source = 'function App() { return null }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('const arrows')
  })

  it('when a tsx file uses const arrow components, ignores it', () => {
    const source = 'const App = () => null\nexport { App }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a non-tsx file uses a function declaration, ignores it', () => {
    const source = 'function helper() { return 1 }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/helper.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a tsx file calls useState, reports it', () => {
    const source = 'const App = () => { const [x] = useState(0); return null }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a tsx file calls useReducer, reports it', () => {
    const source =
      'const App = () => { const [s] = useReducer(r, 0); return null }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a tsx file imports useState, reports it', () => {
    const source = "import { useState } from 'react'\nconst App = () => null"

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a tsx file imports useState under an alias, reports it', () => {
    const source =
      "import { useState as keep } from 'react'\nconst App = () => null"

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a tsx file imports another hook, ignores it', () => {
    const source = "import { useMemo } from 'react'\nconst App = () => null"

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when JSX uses a && conditional, reports it', () => {
    const source =
      'const App = ({ on }: { on: boolean }) => <div>{on && <b>x</b>}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('early return')
  })

  it('when JSX wraps a && conditional in parentheses, reports it', () => {
    const source =
      'const App = ({ on }: { on: boolean }) => <div>{(on && <b>x</b>)}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('early return')
  })

  it('when JSX holds an empty expression, ignores it', () => {
    const source = 'const App = () => <div>{/* note */}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when JSX uses a ternary conditional, ignores it', () => {
    const source =
      'const App = ({ on }: { on: boolean }) => <div>{on ? 1 : 2}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an exported component inlines its props type, reports it', () => {
    const source =
      'export const App = ({ on }: { readonly on: boolean }) => <div>{on}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('named props type')
  })

  it('when an exported component uses a named props type, ignores it', () => {
    const source = 'export const App = ({ on }: AppProps) => <div>{on}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an exported constant is not an arrow, ignores it', () => {
    const source = 'export const limit = 3'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an exported arrow takes a positional parameter, ignores it', () => {
    const source = 'export const App = (props: { on: boolean }) => null'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an exported arrow destructures an untyped parameter, ignores it', () => {
    const source = 'export const App = ({ on }) => null'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an exported arrow takes no parameters, ignores it', () => {
    const source = 'export const App = () => null'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an unexported helper inlines its props type, ignores it', () => {
    const source =
      'const Choice = ({ on }: { readonly on: boolean }) => <div>{on}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a tsx test uses a function declaration component, reports it', () => {
    const source = 'function App() { return null }'

    const diagnostics = checkSource(tsxPlugin, 'tests/example.test.tsx', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('const arrows')
  })

  it('when a tsx test calls useState, reports it', () => {
    const source = 'const App = () => { const [x] = useState(0); return null }'

    const diagnostics = checkSource(tsxPlugin, 'tests/example.test.tsx', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a tsx test calls a plain function, ignores it', () => {
    const source = "describe('x', () => { expect(JSON.stringify(o)) })"

    const diagnostics = checkSource(tsxPlugin, 'tests/example.test.tsx', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a tsx test exports a component with an inline props type, reports it', () => {
    const source =
      'export const App = ({ on }: { readonly on: boolean }) => <div>{on}</div>'

    const diagnostics = checkSource(tsxPlugin, 'tests/example.test.tsx', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('named props type')
  })

  it('when a tsx test uses a JSX && conditional, reports it', () => {
    const source =
      'const App = ({ on }: { on: boolean }) => <div>{on && <b>x</b>}</div>'

    const diagnostics = checkSource(tsxPlugin, 'tests/example.test.tsx', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('early return')
  })

  it('when a non-jsx && expression exists, ignores it', () => {
    const source = 'const ok = (a: boolean, b: boolean) => a && b'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })
})
