import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { classify, parseArgs } from '../../../agents/style-checks/cli.ts'

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

  it('when a named file does not exist, exits 1', async () => {
    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-run',
        '--allow-read',
        '--allow-env',
        'agents/style-checks/cli.ts',
        'src/no-such-file.ts',
      ],
    })

    const output = await command.output()

    expect(output.code).toBe(1)
  })

  it('when a file outside conventions is named, runs advisory checks and exits 0', async () => {
    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-run',
        '--allow-read',
        '--allow-env',
        'agents/style-checks/cli.ts',
        'tests/support/fixtures/style-checks/void-guard.ts',
      ],
    })

    const output = await command.output()

    expect(output.code).toBe(0)
  })
})
