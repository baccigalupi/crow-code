import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../agents/style-checks/engine/check-source.ts'
import { tsxPlugin } from '../../../agents/style-checks/tsx-plugin.ts'

describe('tsxPlugin', () => {
  it('when the plugin is built, lists the six rules in order', () => {
    const plugin = tsxPlugin

    const rules = plugin.rules

    expect(plugin.name).toBe('crow-style-tsx')
    expect(rules).toHaveLength(6)
    expect(rules[0].name).toBe('arrow-function-components')
    expect(rules[1].name).toBe('no-react-state')
    expect(rules[2].name).toBe('no-inline-use-input')
    expect(rules[3].name).toBe('views-only-call-view-models')
    expect(rules[4].name).toBe('no-inline-props-type')
    expect(rules[5].name).toBe('no-jsx-logical-and')
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

  it('when a view calls useInput, reports it', () => {
    const source = 'const App = () => { useInput((i, k) => {}); return null }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('hooks')
  })

  it('when a hooks file calls useInput, ignores it', () => {
    const source = 'export const useKeys = () => { useInput((i, k) => {}) }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/hooks/use-keys.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a hooks tsx file calls useInput, ignores it', () => {
    const source = 'export const useKeys = () => { useInput((i, k) => {}) }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/app/interactions/hooks/use-keys.tsx',
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

  it('when a view splits text into lines, reports it', () => {
    const source =
      "const App = () => <div>{'a\\nb'.split('\\n').map(l => <b key={l}>{l}</b>)}</div>"

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('view model')
  })

  it('when a view renders multi-line text in one Text, ignores it', () => {
    const source = "const App = () => <div>{'a\\nb'}</div>"

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a view calls a plain helper with arguments, reports it', () => {
    const source =
      "const App = ({ u }: { u: string }) => <div>{directory(u, '~/.crow')}</div>"

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('view model')
  })

  it('when a view calls JSON.stringify, reports it', () => {
    const source =
      'const App = ({ o }: { o: object }) => <div>{JSON.stringify(o)}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('view model')
  })

  it('when a view only calls hooks and view models, ignores it', () => {
    const source = `const App = ({ session }) => {
        const buffer = useSignalValue(session.buffer)
        const { rowHeight } = appViewModel({ buffer })
        useKeys(session)
        return <div>{rowHeight}</div>
      }`

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when JSX maps entries to elements, ignores the map call', () => {
    const source =
      'const Chat = ({ items }) => <div>{items.map((e) => <b key={e.id}>{e.t}</b>)}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a view dynamically imports a module, ignores the import', () => {
    const source = "const load = () => import('./x')"

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
