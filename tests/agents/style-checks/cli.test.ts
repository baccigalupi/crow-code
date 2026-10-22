import { describe, expect, it } from 'bun:test'
import {
  classify,
  lintSource,
  parseArgs,
} from '../../../agents/style-checks/cli.ts'

describe('style-check cli', () => {
  it('when a src ts file is named, classifies it as code', () => {
    const file = 'src/example.ts'

    const kind = classify(file)

    expect(kind).toBe('code')
  })

  it('when a tsx file under src is named, classifies it as code', () => {
    const file = 'src/tui/app/view.tsx'

    const kind = classify(file)

    expect(kind).toBe('code')
  })

  it('when a test file is named, classifies it as test', () => {
    const file = 'tests/cli/example.test.ts'

    const kind = classify(file)

    expect(kind).toBe('test')
  })

  it('when a file outside conventions is named, classifies it as other', () => {
    const file = 'tests/support/fixtures/style-checks/void-guard.ts'

    const kind = classify(file)

    expect(kind).toBe('other')
  })

  it('when a test support file is named, classifies it as support', () => {
    const file = 'tests/support/mock-terminal.ts'

    const kind = classify(file)

    expect(kind).toBe('support')
  })

  it('when no args are given, parses to the all scope', () => {
    const args: string[] = []

    const parsed = parseArgs(args)

    expect(parsed).toEqual({ ok: true, scope: 'all', files: [] })
  })

  it('when --changed is given, parses to the changed scope', () => {
    const args = ['--changed']

    const parsed = parseArgs(args)

    expect(parsed).toEqual({ ok: true, scope: 'changed', files: [] })
  })

  it('when files are named, parses to the files scope', () => {
    const args = ['src/example.ts', 'tests/example.test.ts']

    const parsed = parseArgs(args)

    expect(parsed).toEqual({ ok: true, scope: 'files', files: args })
  })

  it('when a scope flag is mixed with files, reports a usage error', () => {
    const args = ['--changed', 'src/example.ts']

    const parsed = parseArgs(args)

    expect(parsed.ok).toBe(false)
  })

  it('when an unknown flag is given, reports a usage error', () => {
    const args = ['--code']

    const parsed = parseArgs(args)

    expect(parsed.ok).toBe(false)
  })

  it('when a code file has a ternary, reports it as path:line:col: plugin/rule: message', () => {
    const source = 'const x = a ? 1 : 2\n'

    const lines = lintSource('src/example.ts', source)

    expect(lines).toEqual([
      'src/example.ts:1:11: crow-style-code/no-ternary: conditionals must be flat; no ternary operator (?:)',
    ])
  })

  it('when a code file names an install input briefly, reports the install rule', () => {
    const source = 'export const repo = 1\n'

    const lines = lintSource('src/tui/install/example.ts', source)

    expect(lines).toEqual([
      'src/tui/install/example.ts:1:14: crow-style-install/full-input-names: install inputs are named repoDirectory, not repo',
    ])
  })

  it('when a tsx code file has a JSX && conditional, reports the tsx rule', () => {
    const source = 'export const View = () => <b>{a && <i />}</b>\n'

    const lines = lintSource('src/tui/example.tsx', source)

    expect(lines).toContain(
      'src/tui/example.tsx:1:31: crow-style-tsx/no-jsx-logical-and: no && conditionals in JSX; use a helper component with early return null',
    )
  })

  it('when a test file has no describe, reports the unit-test rule', () => {
    const source = ''

    const lines = lintSource('tests/example.test.ts', source)

    expect(lines).toEqual([
      'tests/example.test.ts:1:1: crow-style-test/one-top-level-describe: tests must have exactly one top-level describe (found 0)',
    ])
  })

  it('when a support file uses ??, reports the code rule', () => {
    const source = 'export const a = b ?? c\n'

    const lines = lintSource('tests/support/example.ts', source)

    expect(lines).toEqual([
      'tests/support/example.ts:1:18: crow-style-code/no-nullish-coalescing: no ?? operator; write explicit if/early return',
    ])
  })

  it('when a clean test file is named, runs in-process', async () => {
    const command = [
      'agents/style-check',
      'tests/agents/style-checks/cli.test.ts',
    ]

    const child = Bun.spawn(command, { stdout: 'pipe', stderr: 'pipe' })
    const stderr = await new Response(child.stderr).text()

    expect(await child.exited).toBe(0)
    expect(stderr).not.toContain('Checked 1 file')
  })

  it('when a named file does not exist, exits 1', async () => {
    const command = ['agents/style-check', 'src/no-such-file.ts']

    const child = Bun.spawn(command, { stderr: 'pipe' })

    expect(await child.exited).toBe(1)
  })

  it('when a file outside conventions is named, runs advisory checks and exits 0', async () => {
    const command = [
      'agents/style-check',
      'tests/support/fixtures/style-checks/void-guard.ts',
    ]

    const child = Bun.spawn(command, { stdout: 'pipe', stderr: 'pipe' })

    expect(await child.exited).toBe(0)
  })
})
