import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import plugin from '../../../agents/style-checks/code.ts'

describe('style-check code plugin', () => {
  it('when a top-level function declaration exists, reports it', () => {
    const source = 'function example() {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain(
      'module-level functions must be const arrows',
    )
  })

  it('when a constructor uses a parameter property, reports it', () => {
    const source = 'class Example { constructor(private name: string) {} }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no parameter properties')
  })

  it('when a class field is static, reports it', () => {
    const source = 'class Example { static x = 1 }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no static')
  })

  it('when a class method is static, reports it', () => {
    const source = 'class Example { static run() {} }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no static')
  })

  it('when a static block is used, reports it', () => {
    const source = 'class Example { static { this.x = 1 } }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no static')
  })

  it('when class members are not static, does not report it', () => {
    const source = 'class Example { x = 1\n  run() {} }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a ternary is used, reports it', () => {
    const source = 'const x = a ? 1 : 2'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ternary')
  })

  it('when nullish coalescing is used, reports it', () => {
    const source = 'const x = a ?? b'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ??')
  })

  it('when optional chaining is used, reports it', () => {
    const source = 'const x = a?.b'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ?.')
  })

  it('when optional chaining is used in a test, reports it', () => {
    const source = 'const x = a?.b'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ?.')
  })

  it('when a throw is used, reports it', () => {
    const source = 'throw new Error("bad")'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no throws')
  })

  it('when a for loop is used, reports it', () => {
    const source = 'for (let i = 0; i < 1; i++) {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no for')
  })

  it('when a while loop is not infinite, reports it', () => {
    const source = 'while (x) {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('while only allowed')
  })

  it('when an infinite while loop is used, does not report it', () => {
    const source = 'while (true) { break }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a module-level const is SCREAMING_CASE, reports it', () => {
    const source = 'const MAX_SIZE = 10'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('SCREAMING_CASE')
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

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('must be ≤ 7')
  })

  it('when a function declaration is nested inside a function, reports it', () => {
    const source = `const outer = () => {
      function inner() {}
      return inner
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain(
      'no nested function declarations',
    )
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

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('file exceeds 100 lines')
  })

  it('when three consecutive ifs test the same variable, reports it', () => {
    const source = `const example = (x: string) => {
      if (x === 'a') return 1
      if (x === 'b') return 2
      if (x === 'c') return 3
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(3)
    expect(diagnostics[0].message).toContain('guard clauses must be')
    expect(diagnostics[1].message).toContain('guard clauses must be')
    expect(diagnostics[2].message).toContain('if/else if/else')
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

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('guard clauses must be')
  })

  it('when a guard clause is wrapped in a block, does not report it', () => {
    const source = `const example = (x: string | null) => {
      if (x === null) { return '' }
      return x
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a second guard clause follows a guard clause, reports it', () => {
    const source = `const example = (a: string | null, b: string | null) => {
      if (a === null) return ''
      if (b === null) return ''
      return a + b
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('guard clauses must be')
  })

  it('when a guard clause follows a non-guard statement, reports it', () => {
    const source = `const example = (x: string | null) => {
      const y = x
      if (y === null) return ''
      return y
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('guard clauses must be')
  })

  it('when a guard clause body is not a single return, reports it', () => {
    const source = `const example = (x: string | null) => {
      if (x === null) {
        log()
        return ''
      }
      return x
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain(
      'guard clause body must be a single return',
    )
  })

  it('when a guard clause returns a function call, does not report it', () => {
    const source = `const example = (x: string | null) => {
      if (x === null) return example()
      return x
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a guard clause returns an awaited function call, does not report it', () => {
    const source = `const example = async (x: string | null) => {
      if (x === null) return await example()
      return x
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a guard clause is not first and body is not a single return, reports both', () => {
    const source = `const example = (x: string | null) => {
      const y = x
      if (y === null) {
        log()
        return ''
      }
      return y
    }`

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].message).toContain('guard clauses must be')
    expect(diagnostics[1].message).toContain(
      'guard clause body must be a single return',
    )
  })

  it('when a named re-export is used, reports it', () => {
    const source = "export { foo } from './foo'"

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('re-export')
  })

  it('when a wildcard re-export is used, reports it', () => {
    const source = "export * from './foo'"

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('re-export')
  })

  it('when a local named export is used, does not report it', () => {
    const source = 'const foo = 1\nexport { foo }'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a type alias is exported outside types.ts, reports it', () => {
    const source = 'export type Foo = string'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('types.ts')
  })

  it('when an interface is exported outside types.ts, reports it', () => {
    const source = 'export interface Foo {}'

    const diagnostics = Deno.lint.runPlugin(plugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('types.ts')
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
