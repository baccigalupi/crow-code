import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../agents/style-checks/engine/check-source.ts'
import { unitTestsPlugin } from '../../../agents/style-checks/unit-tests-plugin.ts'

describe('unitTestsPlugin', () => {
  it('when the plugin is built, lists the six rules in order', () => {
    const plugin = unitTestsPlugin

    const rules = plugin.rules

    expect(plugin.name).toBe('crow-style-test')
    expect(rules).toHaveLength(6)
    expect(rules[0].name).toBe('one-top-level-describe')
    expect(rules[1].name).toBe('declarations-inside-it')
    expect(rules[2].name).toBe('arrange-act-assert')
    expect(rules[3].name).toBe('nested-describe-minimum')
    expect(rules[4].name).toBe('no-temporary-directories')
    expect(rules[5].name).toBe('no-logic-in-tests')
  })

  it('when a test file has no top-level describe, reports it', () => {
    const source = 'it("works", () => {})'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'tests must have exactly one top-level describe (found 0)',
    )
  })

  it('when a test file has one top-level describe, does not report it', () => {
    const source = 'describe("example", () => { it("works", () => {}) })'

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'tests must have exactly one top-level describe (found 2)',
    )
  })

  it('when a non-test file has no describe, does not report it', () => {
    const source = 'it("works", () => {})'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/support/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test file has a top-level const, reports it', () => {
    const source =
      'const x = 1\ndescribe("example", () => { it("works", () => {}) })'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe('declarations must be inside it blocks')
  })

  it('when a test file has a const inside a describe, reports it', () => {
    const source =
      'describe("example", () => { const x = 1\nit("works", () => {}) })'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe('declarations must be inside it blocks')
  })

  it('when a test file has a function and class outside an it, reports both', () => {
    const source = `
      function helper() {}
      class Helper {}
      describe("example", () => { it("works", () => {}) })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].message).toBe('declarations must be inside it blocks')
    expect(diagnostics[1].message).toBe('declarations must be inside it blocks')
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

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'it block must have exactly three AAA sections (found 0 blank lines)',
    )
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

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a comment sits between statements, does not count it as a blank line', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const x = 1
          // note

          const y = 2

          expect(x).toBe(1)
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an it block is empty, does not report AAA violation', () => {
    const source = 'describe("example", () => { it("works", () => {}) })'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an it block has an expression body, does not report AAA violation', () => {
    const source = 'describe("example", () => { it("works", () => expect(1)) })'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an it block has no callback, does not report AAA violation', () => {
    const source = 'describe("example", () => { it("works") })'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when an it block uses a function expression, reports AAA violation', () => {
    const source = `
      describe("example", () => {
        it("works", function () {
          const x = 1
          expect(x).toBe(1)
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('AAA')
  })

  it('when an it callback is not a function, does not report AAA violation', () => {
    const source = 'describe("example", () => { it("works", callback) })'

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a nested describe has no callback block, counts zero tests', () => {
    const source = `
      describe("example", () => {
        describe("when nested", callback)
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'nested describe needs at least three tests (found 0)',
    )
  })

  it('when a nested describe has an expression body, counts zero tests', () => {
    const source = `
      describe("example", () => {
        describe("when nested", () => it("one", () => {}))
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'nested describe needs at least three tests (found 0)',
    )
  })

  it('when a test makes a temporary directory, reports it', () => {
    const source = `
      describe("example", () => {
        it("works", async () => {
          const directory = await Deno.makeTempDir()

          const copy = directory

          expect(copy).toBe(directory)
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'no temporary directories in tests; use fixed fixture paths under tests/support/fixtures',
    )
  })

  it('when a test makes a temporary directory synchronously, reports it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const directory = Deno.makeTempDirSync()

          const copy = directory

          expect(copy).toBe(directory)
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('no temporary directories')
  })

  it('when a test calls another Deno function, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const text = Deno.readTextFileSync('a')

          const copy = text

          expect(copy).toBe(text)
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test calls makeTempDir on another object, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const directory = fake.makeTempDir()

          const copy = directory

          expect(copy).toBe(directory)
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a non-test file makes a temporary directory, does not report it', () => {
    const source = 'const directory = Deno.makeTempDir()'

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/support/example.ts',
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

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'no logic in tests: assert directly on the result',
    )
  })

  it('when a collection method is called outside an it, does not report it', () => {
    const source = `
      const ids = items.map((item) => item.id)
      describe("example", () => { it("works", () => {}) })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe('declarations must be inside it blocks')
  })

  it('when a test indexes into a collection method name, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [{ id: 1 }]

          const first = items['map']

          expect(first).toBeDefined()
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test calls a computed collection method, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [{ id: 1 }]

          const first = items['map'](String)

          expect(first).toBeDefined()
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test calls a non-collection method, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [1]

          const text = items.join(',')

          expect(text).toBe('1')
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
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

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
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

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'expect must not be inside a loop: assert each element explicitly',
    )
  })

  it('when a non-expect call is inside a loop, does not report it', () => {
    const source = `
      describe("example", () => {
        it("works", () => {
          const items = [1]

          const first = items[0]

          for (const item of items) record(item)
        })
      })
    `

    const diagnostics = checkSource(
      unitTestsPlugin,
      'tests/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })
})
