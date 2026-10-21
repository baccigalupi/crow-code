import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../../agents/style-checks/engine/check-source.ts'
import { noTernary } from '../../../../agents/style-checks/rules/no-ternary.ts'

describe('noTernary', () => {
  it('when a ternary is used, reports it', () => {
    const plugin = { name: 'crow-style-code', rules: [noTernary] }

    const diagnostics = checkSource(
      plugin,
      'src/example.ts',
      'const x = a ? 1 : 2',
    )

    expect(diagnostics).toEqual([
      {
        rule: 'crow-style-code/no-ternary',
        message: 'conditionals must be flat; no ternary operator (?:)',
        line: 1,
        column: 11,
      },
    ])
  })

  it('when a ternary is in a test file, does not report it', () => {
    const plugin = { name: 'crow-style-code', rules: [noTernary] }

    const diagnostics = checkSource(
      plugin,
      'tests/example.test.ts',
      'const x = a ? 1 : 2',
    )

    expect(diagnostics).toEqual([])
  })
})
