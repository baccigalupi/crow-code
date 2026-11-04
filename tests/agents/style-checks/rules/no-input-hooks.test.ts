import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../../agents/style-checks/engine/check-source.ts'
import { noInputHooks } from '../../../../agents/style-checks/rules/no-input-hooks.ts'

describe('noInputHooks', () => {
  it('when a source file calls useKeyboard, reports it', () => {
    const plugin = { name: 'crow-style-code', rules: [noInputHooks] }

    const diagnostics = checkSource(
      plugin,
      'src/tui/example.ts',
      'const listen = () => useKeyboard(press)',
    )

    expect(diagnostics).toEqual([
      {
        rule: 'crow-style-code/no-input-hooks',
        message:
          'input hooks are banned; the runner starts a listener class on renderer.keyInput',
        line: 1,
        column: 22,
      },
    ])
  })

  it('when a source file imports usePaste, reports it', () => {
    const plugin = { name: 'crow-style-code', rules: [noInputHooks] }

    const diagnostics = checkSource(
      plugin,
      'src/tui/example.tsx',
      "import { usePaste } from '@opentui/react'",
    )

    expect(diagnostics).toEqual([
      {
        rule: 'crow-style-code/no-input-hooks',
        message:
          'input hooks are banned; the runner starts a listener class on renderer.keyInput',
        line: 1,
        column: 10,
      },
    ])
  })

  it('when a source file imports useRenderer under an alias, reports it', () => {
    const plugin = { name: 'crow-style-code', rules: [noInputHooks] }

    const diagnostics = checkSource(
      plugin,
      'src/tui/example.tsx',
      "import { useRenderer as renderer } from '@opentui/react'",
    )

    expect(diagnostics).toHaveLength(1)
  })

  it('when a source file uses another hook, ignores it', () => {
    const plugin = { name: 'crow-style-code', rules: [noInputHooks] }

    const diagnostics = checkSource(
      plugin,
      'src/tui/example.tsx',
      "import { useTerminalDimensions } from '@opentui/react'\nconst size = () => useTerminalDimensions()",
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a test file calls useKeyboard, ignores it', () => {
    const plugin = { name: 'crow-style-code', rules: [noInputHooks] }

    const diagnostics = checkSource(
      plugin,
      'tests/tui/example.test.tsx',
      'const listen = () => useKeyboard(press)',
    )

    expect(diagnostics).toHaveLength(0)
  })
})
