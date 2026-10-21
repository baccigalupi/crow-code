import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../agents/style-checks/engine/check-source.ts'
import { installNamesPlugin } from '../../../agents/style-checks/install-names-plugin.ts'

describe('installNamesPlugin', () => {
  it('when the plugin is built, lists the one rule', () => {
    const plugin = installNamesPlugin

    const rules = plugin.rules

    expect(plugin.name).toBe('crow-style-install')
    expect(rules).toHaveLength(1)
    expect(rules[0].name).toBe('full-input-names')
  })

  it('when install code declares a variable named repo, reports it', () => {
    const source = 'const repo = 1\nexport { repo }'

    const diagnostics = checkSource(
      installNamesPlugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].message).toBe(
      'install inputs are named repoDirectory, not repo',
    )
  })

  it('when install code destructures a user parameter, reports it', () => {
    const source = 'export const run = ({ user }: { user: string }) => user'

    const diagnostics = checkSource(
      installNamesPlugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(3)
    expect(diagnostics[0].message).toBe(
      'install inputs are named globalDirectory, not user',
    )
  })

  it('when install tsx passes an env attribute, reports it', () => {
    const source = 'export const App = () => <Done env={1} />'

    const diagnostics = checkSource(
      installNamesPlugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('envFile')
  })

  it('when install code uses a shorthand property, reports it once', () => {
    const source =
      'declare const repoDirectory: string\nexport const o = { repo }'

    const diagnostics = checkSource(
      installNamesPlugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('repoDirectory')
  })

  it('when an install test names a variable repo, reports it', () => {
    const source = 'const repo = 1\nexport { repo }'

    const diagnostics = checkSource(
      installNamesPlugin,
      'tests/tui/install/example.test.ts',
      source,
    )

    expect(diagnostics).toHaveLength(2)
  })

  it('when install code uses the full names, ignores it', () => {
    const source =
      'const repoDirectory = 1\nconst globalDirectory = 2\nconst envFile = 3\n' +
      'export { envFile, globalDirectory, repoDirectory }'

    const diagnostics = checkSource(
      installNamesPlugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when install code names an identifier like an object prototype key, ignores it', () => {
    const source = 'const constructor = 1\nexport { constructor }'

    const diagnostics = checkSource(
      installNamesPlugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when code outside install names a variable repo, ignores it', () => {
    const source = 'const repo = 1\nexport { repo }'

    const diagnostics = checkSource(
      installNamesPlugin,
      'src/tools/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })
})
