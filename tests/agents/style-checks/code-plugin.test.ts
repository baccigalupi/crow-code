import { describe, expect, it } from 'bun:test'
import { codePlugin } from '../../../agents/style-checks/code-plugin.ts'
import { checkSource } from '../../../agents/style-checks/engine/check-source.ts'

describe('codePlugin', () => {
  it('when the plugin is built, lists the twenty rules in order', () => {
    const plugin = codePlugin

    const rules = plugin.rules

    expect(rules).toHaveLength(20)
    expect(rules[0].name).toBe('no-module-function-declaration')
    expect(rules[1].name).toBe('no-parameter-properties')
    expect(rules[2].name).toBe('constructor-assign-only')
    expect(rules[3].name).toBe('no-static')
    expect(rules[4].name).toBe('no-super')
    expect(rules[5].name).toBe('no-ternary')
    expect(rules[6].name).toBe('no-nullish-coalescing')
    expect(rules[7].name).toBe('no-optional-chaining')
    expect(rules[8].name).toBe('no-return-undefined')
    expect(rules[9].name).toBe('no-throw')
    expect(rules[10].name).toBe('no-for-loops')
    expect(rules[11].name).toBe('while-only-infinite')
    expect(rules[12].name).toBe('no-re-exports')
    expect(rules[13].name).toBe('types-only-in-types-files')
    expect(rules[14].name).toBe('no-screaming-case')
    expect(rules[15].name).toBe('max-function-lines')
    expect(rules[16].name).toBe('no-nested-function-declarations')
    expect(rules[17].name).toBe('chained-conditionals')
    expect(rules[18].name).toBe('guard-clause-first-line')
    expect(rules[19].name).toBe('max-file-lines')
  })

  it('when a ternary is used, reports it', () => {
    const source = 'const x = a ? 1 : 2'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ternary')
  })

  it('when a top-level function declaration exists, reports it', () => {
    const source = 'function example() {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain(
      'module-level functions must be const arrows',
    )
  })

  it('when a constructor uses a parameter property, reports it', () => {
    const source = 'class Example { constructor(private name: string) {} }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no parameter properties')
  })

  it('when a constructor branches, reports it', () => {
    const source = `class Example {
      constructor(name: string | undefined) {
        if (name) {
          this.name = name
        }
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('constructors do no work')
  })

  it('when a constructor assignment spans lines, reports it', () => {
    const source = `class Example {
      constructor(pattern: string) {
        this.include = globToRegExp(pattern, {
          globstar: true,
        })
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('constructors do no work')
  })

  it('when a constructor has a small derived assignment, does not report it', () => {
    const source = `class Example {
      constructor(pattern: string) {
        this.include = globToRegExp(pattern, { globstar: true })
        this.quit = quit || ((code) => Deno.exit(code))
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a constructor only assigns fields, does not report it', () => {
    const source = `class Example {
      constructor(name: string, size: number) {
        this.name = name
        this.size = size
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a constructor declares a single-line const local, does not report it', () => {
    const source = `class Example {
      constructor(dir: string) {
        const path = dir || './default'
        this.io = new Io(path)
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a constructor calls a this method, reports it', () => {
    const source = `class Example {
      constructor(filter?: string[]) {
        this.filter = this.buildFilter(filter)
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no this.*() calls')
  })

  it('when a constructor calls a collaborator, does not report it', () => {
    const source = `class Example {
      constructor(data: Data) {
        this.logger = data.logger()
        this.io = new Io(data.path)
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a constructor declares a let, reports it', () => {
    const source = `class Example {
      constructor(dir: string) {
        let path = dir
        this.path = path
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('constructors do no work')
  })

  it('when a class field is static, reports it', () => {
    const source = 'class Example { static x = 1 }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no static')
  })

  it('when a class method is static, reports it', () => {
    const source = 'class Example { static run() {} }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no static')
  })

  it('when a static block is used, reports it', () => {
    const source = 'class Example { static { this.x = 1 } }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no static')
  })

  it('when class members are not static, does not report it', () => {
    const source = 'class Example { x = 1\n  run() {} }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when super is called, reports the constructor and super', () => {
    const source = 'class A extends B { constructor() { super() } }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].message).toBe(
      'constructors do no work; only this.field = value assignments allowed',
    )
    expect(diagnostics[1].message).toBe(
      'no super; subclass field initializers run after super() and clobber inherited constructor state',
    )
  })

  it('when nullish coalescing is used, reports it', () => {
    const source = 'const x = a ?? b'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ??')
  })

  it('when nullish coalescing is used in a test, reports it', () => {
    const source = 'const x = a ?? b'

    const diagnostics = checkSource(codePlugin, 'tests/example.test.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ??')
  })

  it('when nullish coalescing is used in a test support file, reports it', () => {
    const source = 'const x = a ?? b'

    const diagnostics = checkSource(
      codePlugin,
      'tests/support/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ??')
  })

  it('when nullish assignment is used, does not report it', () => {
    const source = 'a ??= b'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when optional chaining is used, reports it', () => {
    const source = 'const x = a?.b'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ?.')
  })

  it('when optional chaining is used in a test, reports it', () => {
    const source = 'const x = a?.b'

    const diagnostics = checkSource(codePlugin, 'tests/example.test.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ?.')
  })

  it('when a chain continues after the optional link, reports once', () => {
    const source = 'const x = a?.b.c'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
  })

  it('when an optional call is used, reports it', () => {
    const source = 'const x = a?.()'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no ?.')
  })

  it('when return undefined is used, reports it', () => {
    const source = `const example = () => {
      return undefined
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('bare return')
  })

  it('when return undefined is parenthesized, reports it', () => {
    const source = `const example = () => {
      return (undefined)
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('bare return')
  })

  it('when a bare return is used, does not report it', () => {
    const source = `const example = () => {
      return
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a throw is used, reports it', () => {
    const source = 'throw new Error("bad")'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no throws')
  })

  it('when a for loop is used, reports it', () => {
    const source = 'for (let i = 0; i < 1; i++) {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no for')
  })

  it('when a for-in loop is used, reports it', () => {
    const source = 'for (const k in o) {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'collections use iterators; no for-in loops',
    )
  })

  it('when a for-of loop is used, reports it', () => {
    const source = 'for (const v of o) {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'collections use iterators; no for-of loops',
    )
  })

  it('when a while loop is not infinite, reports it', () => {
    const source = 'while (x) {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('while only allowed')
  })

  it('when an infinite while loop is used, does not report it', () => {
    const source = 'while (true) { break }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when an infinite while loop is parenthesized, does not report it', () => {
    const source = 'while ((true)) { break }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a named re-export is used, reports it', () => {
    const source = "export { foo } from './foo'"

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('re-export')
  })

  it('when a wildcard re-export is used, reports it', () => {
    const source = "export * from './foo'"

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('re-export')
  })

  it('when a namespace re-export is used, reports the wildcard message', () => {
    const source = "export * as ns from './foo'"

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'do not re-export all from feature modules; consumers import directly',
    )
  })

  it('when a local named export is used, does not report it', () => {
    const source = 'const foo = 1\nexport { foo }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a type alias is exported outside types.ts, reports it', () => {
    const source = 'export type Foo = string'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('types.ts')
  })

  it('when an interface is exported outside types.ts, reports it', () => {
    const source = 'export interface Foo {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('types.ts')
  })

  it('when an enum is exported outside types.ts, reports it', () => {
    const source = 'export enum E {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'type exports are only allowed in types.ts files',
    )
  })

  it('when a type is re-exported, reports the re-export and the type export', () => {
    const source = "export type { X } from './x'"

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].message).toBe(
      'do not re-export from feature modules; consumers import directly',
    )
    expect(diagnostics[1].message).toBe(
      'type exports are only allowed in types.ts files',
    )
  })

  it('when an interface merges with a delegate-decorated class, does not report it', () => {
    const source = `@delegate({}, 'x')
export class Host {}
export interface Host {}`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when an interface merges with an undecorated class, reports it', () => {
    const source = 'export class Host {}\nexport interface Host {}'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('types.ts')
  })

  it('when a type is exported from types.ts, does not report it', () => {
    const source = 'export type Foo = string'

    const diagnostics = checkSource(codePlugin, 'src/types.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a type is not exported, does not report it', () => {
    const source = 'type Foo = string'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a module-level const is SCREAMING_CASE, reports it', () => {
    const source = 'const MAX_SIZE = 10'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('SCREAMING_CASE')
  })

  it('when an exported const is SCREAMING_CASE, reports it', () => {
    const source = 'export const MAX_SIZE = 10'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('SCREAMING_CASE')
  })

  it('when a nested const is SCREAMING_CASE, does not report it', () => {
    const source = 'const inner = () => { const MAX_SIZE = 1 }'

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
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

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('must be ≤ 7')
  })

  it('when a function body has seven non-blank lines, ignores blank lines', () => {
    const source = `const example = () => {
      const a = 1

      const b = 2

      const c = 3

      const d = 4

      const e = 5

      const f = 6

      return a + b + c + d + e + f
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a class method body exceeds seven lines, reports it', () => {
    const source = `class Example {
      run() {
        this.a = 1
        this.b = 2
        this.c = 3
        this.d = 4
        this.e = 5
        this.f = 6
        this.g = 7
        this.h = 8
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'function/method body is 8 lines; must be ≤ 7',
    )
  })

  it('when a constructor body exceeds seven lines, reports it', () => {
    const source = `class Example {
      constructor() {
        this.a = 1
        this.b = 2
        this.c = 3
        this.d = 4
        this.e = 5
        this.f = 6
        this.g = 7
        this.h = 8
      }
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'function/method body is 8 lines; must be ≤ 7',
    )
  })

  it('when a function declaration is nested inside a function, reports it', () => {
    const source = `const outer = () => {
      function inner() {}
      return inner
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no nested function declarations')
  })

  it('when an arrow function is nested inside a function, does not report it', () => {
    const source = `const outer = () => {
      const inner = () => {}
      return inner
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when three consecutive ifs test the same variable, reports it', () => {
    const source = `const example = (x: string) => {
      if (x === 'a') result = 1
      if (x === 'b') result = 2
      if (x === 'c') result = 3
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'mutually exclusive branches must use if/else if/else, not consecutive ifs',
    )
  })

  it('when branches are written as if/else if/else, does not report it', () => {
    const source = `const example = (x: string) => {
      if (x === 'a') return 1
      else if (x === 'b') return 2
      else return 3
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

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

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when three consecutive ifs return, reports guards and the chain', () => {
    const source = `const example = (x: string) => {
      if (x === 'a') return 1
      if (x === 'b') return 2
      if (x === 'c') return 3
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(3)
    expect(diagnostics[0].message).toContain('guard clauses must be')
    expect(diagnostics[1].message).toContain('guard clauses must be')
    expect(diagnostics[2].message).toContain('if/else if/else')
  })

  it('when a guard clause is on the first line, does not report it', () => {
    const source = `const example = (x: string | null) => {
      if (x === null) return ''
      return x
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a guard clause is not on the first line, reports it', () => {
    const source = `const example = (x: string | null) => {
      const y = x
      if (y === null) return ''
      return y
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('guard clauses must be')
  })

  it('when a guard clause is wrapped in a block, does not report it', () => {
    const source = `const example = (x: string | null) => {
      if (x === null) { return '' }
      return x
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a second guard clause follows a guard clause, reports it', () => {
    const source = `const example = (a: string | null, b: string | null) => {
      if (a === null) return ''
      if (b === null) return ''
      return a + b
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

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

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

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

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a guard clause returns an awaited function call, does not report it', () => {
    const source = `const example = async (x: string | null) => {
      if (x === null) return await example()
      return x
    }`

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

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

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].message).toContain('guard clauses must be')
    expect(diagnostics[1].message).toContain(
      'guard clause body must be a single return',
    )
  })

  it('when a file exceeds one hundred lines, reports it', () => {
    const source = Array.from({ length: 110 }, () => '// line').join('\n')

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('file exceeds 100 lines')
  })

  it('when a tsx file exceeds one hundred lines, reports it', () => {
    const source = Array.from({ length: 110 }, () => '// line').join('\n')

    const diagnostics = checkSource(codePlugin, 'src/example.tsx', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('file exceeds 100 lines')
  })

  it('when delegate decorator lines bring an over-limit file under one hundred lines, does not report it', () => {
    const source = [
      ...Array.from({ length: 90 }, () => '// line'),
      '@delegate(',
      '  {',
      "    alpha: 'alpha',",
      "    beta: 'beta',",
      "    gamma: 'gamma',",
      "    delta: 'delta',",
      '  },',
      "  'first',",
      ')',
      '@delegate(',
      '  {',
      "    epsilon: 'epsilon',",
      "    zeta: 'zeta',",
      "    eta: 'eta',",
      "    theta: 'theta',",
      '  },',
      "  'second',",
      ')',
      'export class Host {}',
    ].join('\n')

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a delegate-decorated class is nested below top level, its decorator lines are excluded', () => {
    const source = [
      ...Array.from({ length: 95 }, () => '// line'),
      'if (flag) {',
      '  @delegate(',
      '    {',
      "      alpha: 'alpha',",
      "      beta: 'beta',",
      "      gamma: 'gamma',",
      "      delta: 'delta',",
      '    },',
      "    'first',",
      '  )',
      '  class Host {}',
      '}',
    ].join('\n')

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(0)
  })

  it('when a file still exceeds one hundred lines after excluding delegate decorators, reports it', () => {
    const source = [
      ...Array.from({ length: 105 }, () => '// line'),
      '@delegate(',
      '  {',
      "    alpha: 'alpha',",
      "    beta: 'beta',",
      "    gamma: 'gamma',",
      "    delta: 'delta',",
      '  },',
      "  'first',",
      ')',
      'export class Host {}',
    ].join('\n')

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('file exceeds 100 lines')
  })

  it('when a merged interface would take the file under the limit, still reports', () => {
    const source = [
      ...Array.from({ length: 90 }, () => '// line'),
      '@delegate(',
      '  {',
      "    alpha: 'alpha',",
      "    beta: 'beta',",
      "    gamma: 'gamma',",
      "    delta: 'delta',",
      '  },',
      "  'first',",
      ')',
      'export class Host {}',
      'export interface Host {',
      '  a(): void',
      '  b(): void',
      '  c(): void',
      '  d(): void',
      '  e(): void',
      '  f(): void',
      '  g(): void',
      '  h(): void',
      '}',
    ].join('\n')

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('file exceeds 100 lines')
  })

  it('when a non-delegate decorator spans lines, still reports', () => {
    const source = [
      ...Array.from({ length: 95 }, () => '// line'),
      '@other(',
      '  {',
      "    alpha: 'alpha',",
      "    beta: 'beta',",
      "    gamma: 'gamma',",
      "    delta: 'delta',",
      '  },',
      "  'first',",
      ')',
      'export class Host {}',
    ].join('\n')

    const diagnostics = checkSource(codePlugin, 'src/example.ts', source)

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('file exceeds 100 lines')
  })
})
