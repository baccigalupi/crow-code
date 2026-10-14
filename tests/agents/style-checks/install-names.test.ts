import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import plugin from '../../../agents/style-checks/install-names.ts'

describe('style-check install-names plugin', () => {
  it('when install code declares a variable named repo, reports it', () => {
    const source = 'const repo = 1\nexport { repo }'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics.length).toBeGreaterThan(0)
    expect(diagnostics[0].message).toContain('repoDirectory')
  })

  it('when install code destructures a user parameter, reports it', () => {
    const source = 'export const run = ({ user }: { user: string }) => user'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics.length).toBeGreaterThan(0)
    expect(diagnostics[0].message).toContain('globalDirectory')
  })

  it('when install tsx passes an env attribute, reports it', () => {
    const source = 'export const App = () => <Done env={1} />'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'src/tui/install/example.tsx',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('envFile')
  })

  it('when an install test names a variable repo, reports it', () => {
    const source = 'const repo = 1\nexport { repo }'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'tests/tui/install/example.test.ts',
      source,
    )

    expect(diagnostics.length).toBeGreaterThan(0)
  })

  it('when install code uses the full names, ignores it', () => {
    const source =
      'const repoDirectory = 1\nconst globalDirectory = 2\nconst envFile = 3\n' +
      'export { envFile, globalDirectory, repoDirectory }'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'src/tui/install/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when code outside install names a variable repo, ignores it', () => {
    const source = 'const repo = 1\nexport { repo }'

    const diagnostics = Deno.lint.runPlugin(
      plugin,
      'src/tools/example.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })
})
