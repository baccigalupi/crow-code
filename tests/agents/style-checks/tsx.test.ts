import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import plugin from '../../../agents/style-checks/tsx.ts'

const check = (source: string, fileName = 'src/tui/install/example.tsx') =>
  Deno.lint.runPlugin(plugin, fileName, source)

describe('style-check tsx plugin', () => {
  it('when a tsx file uses a function declaration, reports it', () => {
    const diagnostics = check('function App() { return null }')

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('const arrows')
  })

  it('when a tsx file uses const arrow components, ignores it', () => {
    const diagnostics = check('const App = () => null\nexport { App }')

    expect(diagnostics).toHaveLength(0)
  })

  it('when a non-tsx file uses a function declaration, ignores it', () => {
    const diagnostics = check(
      'function helper() { return 1 }',
      'src/tui/install/helper.ts',
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a tsx file calls useState, reports it', () => {
    const diagnostics = check(
      'const App = () => { const [x] = useState(0); return null }',
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a tsx file calls useReducer, reports it', () => {
    const diagnostics = check(
      'const App = () => { const [s] = useReducer(r, 0); return null }',
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a tsx file imports useState, reports it', () => {
    const diagnostics = check(
      "import { useState } from 'react'\nconst App = () => null",
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('signals')
  })

  it('when a view calls useInput, reports it', () => {
    const diagnostics = check(
      'const App = () => { useInput((i, k) => {}); return null }',
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('hooks')
  })

  it('when a hooks file calls useInput, ignores it', () => {
    const diagnostics = check(
      'export const useKeys = () => { useInput((i, k) => {}) }',
      'src/tui/install/hooks/use-keys.ts',
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a hooks tsx file calls useInput, ignores it', () => {
    const diagnostics = check(
      'export const useKeys = () => { useInput((i, k) => {}) }',
      'src/tui/app/interactions/hooks/use-keys.tsx',
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when JSX uses a && conditional, reports it', () => {
    const diagnostics = check(
      'const App = ({ on }: { on: boolean }) => <div>{on && <b>x</b>}</div>',
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('early return')
  })

  it('when JSX uses a ternary conditional, ignores it', () => {
    const diagnostics = check(
      'const App = ({ on }: { on: boolean }) => <div>{on ? 1 : 2}</div>',
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a view splits text into lines, reports it', () => {
    const diagnostics = check(
      "const App = () => <div>{'a\\nb'.split('\\n').map(l => <b key={l}>{l}</b>)}</div>",
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('view model')
  })

  it('when a view renders multi-line text in one Text, ignores it', () => {
    const diagnostics = check(
      "const App = () => <div>{'a\\nb'}</div>",
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a view calls a plain helper with arguments, reports it', () => {
    const diagnostics = check(
      "const App = ({ u }: { u: string }) => <div>{directory(u, '~/.crow')}</div>",
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('view model')
  })

  it('when a view calls JSON.stringify, reports it', () => {
    const diagnostics = check(
      'const App = ({ o }: { o: object }) => <div>{JSON.stringify(o)}</div>',
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('view model')
  })

  it('when a view only calls hooks and view models, ignores it', () => {
    const diagnostics = check(
      `const App = ({ session }) => {
        const buffer = useSignalValue(session.buffer)
        const { rowHeight } = appViewModel({ buffer })
        useKeys(session)
        return <div>{rowHeight}</div>
      }`,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when JSX maps entries to elements, ignores the map call', () => {
    const diagnostics = check(
      'const Chat = ({ items }) => <div>{items.map((e) => <b key={e.id}>{e.t}</b>)}</div>',
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a non-jsx && expression exists, ignores it', () => {
    const diagnostics = check(
      'const ok = (a: boolean, b: boolean) => a && b',
    )

    expect(diagnostics).toHaveLength(0)
  })
})
