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

    expect(
      diagnostics.some((d) => d.message.includes('AAA')),
    ).toBe(true)
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
})
