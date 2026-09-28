import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import plugin from '../../../agents/style-checks/code.ts'

describe('style-check code plugin', () => {
  it('when a top-level function declaration exists, reports it', () => {
    const source = 'function example() {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) =>
        d.message.includes('module-level functions must be const arrows')
      ),
    ).toBe(true)
  })

  it('when a constructor uses a parameter property, reports it', () => {
    const source = 'class Example { constructor(private name: string) {} }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('no parameter properties')),
    ).toBe(true)
  })

  it('when a ternary is used, reports it', () => {
    const source = 'const x = a ? 1 : 2'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics.some((d) => d.message.includes('no ternary'))).toBe(
      true,
    )
  })

  it('when nullish coalescing is used, reports it', () => {
    const source = 'const x = a ?? b'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics.some((d) => d.message.includes('no ??'))).toBe(true)
  })

  it('when optional chaining is used, reports it', () => {
    const source = 'const x = a?.b'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics.some((d) => d.message.includes('no ?.'))).toBe(true)
  })

  it('when a throw is used, reports it', () => {
    const source = 'throw new Error("bad")'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics.some((d) => d.message.includes('no throws'))).toBe(true)
  })

  it('when a for loop is used, reports it', () => {
    const source = 'for (let i = 0; i < 1; i++) {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics.some((d) => d.message.includes('no for'))).toBe(true)
  })

  it('when a while loop is not infinite, reports it', () => {
    const source = 'while (x) {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('while only allowed')),
    ).toBe(true)
  })

  it('when an infinite while loop is used, does not report it', () => {
    const source = 'while (true) { break }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a module-level const is SCREAMING_CASE, reports it', () => {
    const source = 'const MAX_SIZE = 10'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('SCREAMING_CASE')),
    ).toBe(true)
  })

  it('when a function body exceeds seven lines, reports it', () => {
    const source = `const example = () => {
      const a = 1
      const b = 2
      const c = 3
      const d = 4
      const e = 5
      const f = 6
      const g = 7
      const h = 8
      return a + b + c + d + e + f + g + h
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics.some((d) => d.message.includes('must be ≤ 7'))).toBe(
      true,
    )
  })

  it('when a function declaration is nested inside a function, reports it', () => {
    const source = `const outer = () => {
      function inner() {}
      return inner
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) =>
        d.message.includes('no nested function declarations')
      ),
    ).toBe(true)
  })

  it('when an arrow function is nested inside a function, does not report it', () => {
    const source = `const outer = () => {
      const inner = () => {}
      return inner
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a file exceeds one hundred lines, reports it', () => {
    const source = Array.from({ length: 110 }, () => '// line').join('\n')

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('file exceeds 100 lines')),
    ).toBe(true)
  })

  it('when three consecutive ifs test the same variable, reports it', () => {
    const source = `const example = (x: string) => {
      if (x === 'a') return 1
      if (x === 'b') return 2
      if (x === 'c') return 3
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('if/else if/else')),
    ).toBe(true)
  })

  it('when branches are written as if/else if/else, does not report it', () => {
    const source = `const example = (x: string) => {
      if (x === 'a') return 1
      else if (x === 'b') return 2
      else return 3
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when consecutive ifs test different variables, does not report it', () => {
    const source = `const example = (a: string, b: string, c: string) => {
      let result = 0
      if (a === 'a') result = 1
      if (b === 'b') result = 2
      if (c === 'c') result = 3
      return result
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a guard clause is on the first line, does not report it', () => {
    const source = `const example = (x: string | null) => {
      if (x === null) return ''
      return x
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a guard clause is not on the first line, reports it', () => {
    const source = `const example = (x: string | null) => {
      const y = x
      if (y === null) return ''
      return y
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('guard clauses must be')),
    ).toBe(true)
  })

  it('when a guard clause is wrapped in a block, does not report it', () => {
    const source = `const example = (x: string | null) => {
      if (x === null) { return '' }
      return x
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a named re-export is used, reports it', () => {
    const source = "export { foo } from './foo'"

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('re-export')),
    ).toBe(true)
  })

  it('when a wildcard re-export is used, reports it', () => {
    const source = "export * from './foo'"

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('re-export')),
    ).toBe(true)
  })

  it('when a local named export is used, does not report it', () => {
    const source = 'const foo = 1\nexport { foo }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a type alias is exported outside types.ts, reports it', () => {
    const source = 'export type Foo = string'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('types.ts')),
    ).toBe(true)
  })

  it('when an interface is exported outside types.ts, reports it', () => {
    const source = 'export interface Foo {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(
      diagnostics.some((d) => d.message.includes('types.ts')),
    ).toBe(true)
  })

  it('when a type is exported from types.ts, does not report it', () => {
    const source = 'export type Foo = string'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/types.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a type is not exported, does not report it', () => {
    const source = 'type Foo = string'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })
})
