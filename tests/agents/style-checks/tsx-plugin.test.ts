import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../agents/style-checks/engine/check-source.ts'
import { tsxPlugin } from '../../../agents/style-checks/tsx-plugin.ts'

describe('tsxPlugin', () => {
  it('when the plugin is built, lists the seven rules in order', () => {
    const plugin = tsxPlugin

    const rules = plugin.rules

    expect(plugin.name).toBe('crow-style-tsx')
    expect(rules).toHaveLength(7)
    expect(rules[0].name).toBe('arrow-function-components')
    expect(rules[1].name).toBe('no-react-state')
    expect(rules[2].name).toBe('no-inline-props-type')
    expect(rules[3].name).toBe('no-if-else-in-tsx')
    expect(rules[4].name).toBe('no-functions-in-components')
    expect(rules[5].name).toBe('jsx-single-expression')
    expect(rules[6].name).toBe('component-names')
  })

  describe('component-names', () => {
    it('when a lowercase arrow returns jsx, reports it', () => {
      const source = 'const row = (item) => <Row item={item} />\nexport { row }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('capitalize')
    })

    it('when a lowercase arrow returns jsx from a block, reports it', () => {
      const source =
        'const row = (item) => { const x = item; return <Row item={x} /> }\nexport { row }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('capitalize')
    })

    it('when a component is passed as a function, reports it', () => {
      const source =
        'const App = () => { const rows = items.map(Row); return <box /> }\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('never call them')
    })

    it('when a component is called, reports it', () => {
      const source = 'const App = () => Row({ item })\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('never call them')
    })

    it('when a builtin like String is called, ignores it', () => {
      const source =
        'const App = () => <text key={key}>{name}</text>\nconst key = String(1)\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(0)
    })

    it('when a ts file passes a capitalized name, ignores it', () => {
      const source = 'const rows = items.map(Row)\nexport { rows }'

      const diagnostics = checkSource(tsxPlugin, 'src/tui/example.ts', source)

      expect(diagnostics).toHaveLength(0)
    })
  })

  it('when a component defines a function, reports it', () => {
    const source =
      'const App = () => { const handle = () => 1; return <box onMouse={handle} /> }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain(
      'no functions defined in components',
    )
  })

  it('when a component defines a function expression, reports it twice', () => {
    const source =
      'const App = () => { const handle = function () { return 1 }; return <box onMouse={handle} /> }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[1].message).toContain('const arrows')
    expect(diagnostics[0].message).toContain(
      'no functions defined in components',
    )
  })

  it('when a class method in a tsx file defines a function, ignores it', () => {
    const source =
      'class Panel { run() { const done = () => 1; return done } }\nexport { Panel }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a tsx file defines a function at module level, ignores it', () => {
    const source = 'const Row = () => null\nconst App = () => <Row />'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a ts file defines a function inside a function, ignores it', () => {
    const source =
      'const helper = () => { const inner = () => 1; return inner }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/helper.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a tsx file has an if/else, reports it', () => {
    const source =
      'const App = () => { if (x) { return null } else { return 1 } }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no if/else in tsx')
  })

  it('when a tsx file has a guard with no else, ignores it', () => {
    const source = 'const App = () => { if (x) return null; return 1 }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a ts file has an if/else, ignores it', () => {
    const source =
      'const helper = () => { if (x) { return 0 } else { return 1 } }'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/helper.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
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

  describe('jsx-single-expression', () => {
    it('when an attribute does arithmetic, reports it', () => {
      const source = 'const App = () => <box top={row + 1} />\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('one attribute or one call')
    })

    it('when a child is a template literal, reports it', () => {
      const source =
        'const App = () => <text>{`${label}:`}</text>\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('one attribute or one call')
    })

    it('when an attribute is two attributes deep, reports it', () => {
      const source =
        'const App = () => <box color={theme.panel.background} />\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('one attribute or one call')
    })

    it('when a call is two attributes deep, reports it', () => {
      const source =
        'const App = () => <text>{view.label.text()}</text>\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('one attribute or one call')
    })

    it('when a call takes another call, reports it', () => {
      const source =
        'const App = () => <text>{format(model.text())}</text>\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('one attribute or one call')
    })

    it('when a call takes an arrow, reports it', () => {
      const source =
        'const App = () => <box>{rows.map((row) => row)}</box>\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('one attribute or one call')
    })

    it('when a mapping component wraps the map in an element, reports it', () => {
      const source =
        'const Rows = () => <box>{items.map((item) => <Row key={item.id} item={item} />)}</box>\nexport { Rows }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('only the mapping')
    })

    it('when a component maps beside other children, reports it', () => {
      const source =
        'const App = () => <box><text>]</text>{items.map((item) => <Row key={item.id} item={item} />)}</box>\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('only the mapping')
    })

    it('when a map is nested below the root element, reports it', () => {
      const source =
        'const App = () => <box><box>{items.map((item) => <Row key={item.id} item={item} />)}</box></box>\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('only the mapping')
    })

    it('when a component with a block body maps, reports it', () => {
      const source =
        'const App = () => { const rows = items; return <box>{rows.map((item) => <Row key={item.id} item={item} />)}</box> }\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('only the mapping')
    })

    it('when a component only maps inside a fragment, ignores it', () => {
      const source =
        'const Rows = () => <>{items.map((item) => <Row key={item.id} item={item} />)}</>\nexport { Rows }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(0)
    })

    it('when a list maps each item to one parenthesized element, ignores it', () => {
      const source =
        'const Rows = () => <>{items.map((item) => (<Row key={item.id} item={item} />))}</>\nexport { Rows }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(0)
    })

    it('when a listed element holds logic, reports it', () => {
      const source =
        'const Rows = () => <>{items.map((item) => <Row item={format(label(item))} />)}</>\nexport { Rows }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toContain('one attribute or one call')
    })

    it('when expressions are a value, an attribute or one plain call, ignores them', () => {
      const source =
        'const App = () => <box top={1} title="t" width={view.width} key={name}>{rows.map(format)}{view.label(model, 2)}{fields[name]}</box>\nexport { App }'

      const diagnostics = checkSource(
        tsxPlugin,
        'src/tui/install/example.tsx',
        source,
      )

      expect(diagnostics).toHaveLength(0)
    })
  })

  it('when a tsx file uses a function expression, reports it', () => {
    const source = 'const reveal = function () { return 1 }\nexport { reveal }'

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
    expect(diagnostics[0].message).toContain('one attribute or one call')
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
    expect(diagnostics[0].message).toContain('one attribute or one call')
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

  it('when JSX uses a ternary conditional, reports it', () => {
    const source =
      'const App = ({ on }: { on: boolean }) => <div>{on ? 1 : 2}</div>'

    const diagnostics = checkSource(
      tsxPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('one attribute or one call')
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
