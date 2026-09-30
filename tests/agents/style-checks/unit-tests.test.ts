import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import plugin from '../../../agents/style-checks/unit-tests.ts'

describe('style-check unit-tests plugin', () => {
  it('when a test file has no top-level describe, reports it', () => {
    const source = 'it("works", () => {})'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics.length).toBeGreaterThan(0)
  })

  it('when a test file has one top-level describe, does not report it', () => {
    const source = 'describe("example", () => { it("works", () => {}) })'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test file has multiple top-level describes, reports it', () => {
    const source = `
      describe("one", () => { it("works", () => {}) })
      describe("two", () => { it("works", () => {}) })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics.length).toBeGreaterThan(0)
  })

  it('when a test file has a top-level const, reports it', () => {
    const source =
      'const x = 1\ndescribe("example", () => { it("works", () => {}) })'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics.length).toBeGreaterThan(0)
  })

  it('when a test file has a const inside a describe, reports it', () => {
    const source =
      'describe("example", () => { const x = 1\nit("works", () => {}) })'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics.length).toBeGreaterThan(0)
  })

  it('when a test file has a const inside an it, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const x = 1

          const y = x

          expect(x).toBe(1)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an it block has no blank lines, reports AAA violation', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const x = 1
          const y = 2
          expect(x).toBe(1)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('AAA')
  })

  it('when blank lines are inside a string literal, does not count them', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const x = \`a

          b

          c\`

          const y = x

          expect(y).toBe(x)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an it block has three sections, does not report AAA violation', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const x = 1

          const y = 2

          expect(x).toBe(1)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a nested describe has fewer than three tests, reports it', () => {
    const source = `
      describe("example", () => {
        describe("when nested", () => {
          it("one", () => {})
          it("two", () => {})
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'nested describe needs at least three tests (found 2)',
    )
  })

  it('when a nested describe has three tests, does not report it', () => {
    const source = `
      describe("example", () => {
        describe("when nested", () => {
          it("one", () => {})
          it("two", () => {})
          it("three", () => {})
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test maps inside expect, reports it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [{ id: 1 }]

          const expected = [1]

          expect(items.map((item) => item.id)).toEqual(expected)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'no logic in tests: assert directly on the result',
    )
  })

  it('when a test maps in Act, reports it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [{ id: 1 }]

          const ids = items.map((item) => item.id)

          expect(ids).toEqual([1])
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'no logic in tests: assert directly on the result',
    )
  })

  it('when a test asserts directly on the result, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [{ id: 1 }]

          const first = items[0]

          expect(first.id).toBe(1)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test passes a function to expect, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const fn = () => 1

          const runner = () => fn()

          expect(runner).toThrow()
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when expect is inside a for-of loop, reports it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [1]

          const first = items[0]

          for (const item of items) expect(item).toBe(1)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'expect must not be inside a loop: assert each element explicitly',
    )
  })

  it('when expect is inside a while loop, reports it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [1]
          let done = false

          while (!done) {
            expect(items[0]).toBe(1)
            done = true
          }

          expect(done).toBe(true)
        })
      })
    `

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'expect must not be inside a loop: assert each element explicitly',
    )
  })
})
