import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  candidatesByFile,
  collectGuardCallCandidates,
  lintFilePath,
  returnTypeIsVoid,
} from '../../../agents/style-checks/void-guard-calls-analysis.ts'

describe('void-guard-calls analysis', () => {
  it('when a guard returns an identifier call, collects its position', () => {
    const source = `const f = (x: string | null) => {
  if (x === null) return fail()
  return x
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toEqual({ line: 1, character: 25 })
  })

  it('when a guard returns a member call, collects the property position', () => {
    const source = `const f = (x: string | null) => {
  if (x === null) return helper.fail()
  return x
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toEqual({ line: 1, character: 32 })
  })

  it('when a guard returns an awaited call, collects it', () => {
    const source = `const f = async (x: string | null) => {
  if (x === null) return await load()
  return x
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toEqual({ line: 1, character: 31 })
  })

  it('when a guard returns a literal, collects nothing', () => {
    const source = `const f = (x: string | null) => {
  if (x === null) return ''
  return x
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(0)
  })

  it('when a guard returns a plain identifier, collects nothing', () => {
    const source = `const f = (x: string | null) => {
  if (x === null) return fallback
  return x
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(0)
  })

  it('when an if has an else branch, collects nothing', () => {
    const source = `const f = (x: string | null) => {
  if (x === null) return a()
  else return b()
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(0)
  })

  it('when a call return sits in an else-if dispatch chain, collects nothing', () => {
    const source = `const f = (x: number) => {
  if (x === 1) return hA()
  else if (x === 2) return hB()
  return z
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(0)
  })

  it('when a guard body has a call then a return, collects nothing', () => {
    const source = `const f = (x: string | null) => {
  if (x === null) { log(); return }
  return x
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(0)
  })

  it('when a guard is nested unbraced, still collects it', () => {
    const source = `const f = (a: number, b: number) => {
  if (a === 1) if (b === 2) return g()
  return 0
}`

    const candidates = collectGuardCallCandidates('src/example.ts', source)

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toEqual({ line: 1, character: 35 })
  })

  it('when hover shows a void arrow return, flags it', () => {
    const hover = '```typescript\nconst f: () => void\n```'

    const flagged = returnTypeIsVoid(hover)

    expect(flagged).toBe(true)
  })

  it('when hover shows a promise void method return, flags it', () => {
    const hover = '```typescript\n(method) C.m(k: number): Promise<void>\n```'

    const flagged = returnTypeIsVoid(hover)

    expect(flagged).toBe(true)
  })

  it('when hover shows a value return, does not flag it', () => {
    const hover = '```typescript\nfunction f(x: number): string\n```'

    const flagged = returnTypeIsVoid(hover)

    expect(flagged).toBe(false)
  })

  it('when hover shows a non-function const, does not flag it', () => {
    const hover = '```typescript\nconst x: number\n```'

    const flagged = returnTypeIsVoid(hover)

    expect(flagged).toBe(false)
  })

  it('when hover shows a function returning a void function, does not flag it', () => {
    const hover = '```typescript\nconst f: () => () => void\n```'

    const flagged = returnTypeIsVoid(hover)

    expect(flagged).toBe(false)
  })

  it('when hover text is empty, does not flag it', () => {
    const hover = ''

    const flagged = returnTypeIsVoid(hover)

    expect(flagged).toBe(false)
  })

  it('when lint json carries a candidate marker, groups it by file', () => {
    const json = JSON.stringify({
      diagnostics: [
        {
          filename: 'file:///repo/src/example.ts',
          message: 'void-guard-candidate:3:14',
        },
        { filename: 'file:///repo/src/example.ts', message: 'no-var' },
      ],
    })

    const grouped = candidatesByFile(json)

    expect(grouped.get('file:///repo/src/example.ts')).toEqual([
      { line: 3, character: 14 },
    ])
  })

  it('when lint json is malformed, groups nothing', () => {
    const json = 'not json'

    const grouped = candidatesByFile(json)

    expect(grouped.size).toBe(0)
  })

  it('when a lint filename is a file url, converts it to a path', () => {
    const filename = 'file:///repo/src/example.ts'

    const path = lintFilePath(filename)

    expect(path).toBe('/repo/src/example.ts')
  })

  it('when a lint filename is relative, resolves it against the cwd', () => {
    const filename = 'src/example.ts'

    const path = lintFilePath(filename)

    expect(path.endsWith('/src/example.ts')).toBe(true)
  })

  it('when a fixture guard returns a void call, the runner flags it', async () => {
    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-run',
        '--allow-read',
        '--allow-env',
        'agents/style-checks/void-guard-calls.ts',
        'tests/support/fixtures/style-checks/void-guard.ts',
      ],
    })

    const output = await command.output()
    const stdout = new TextDecoder().decode(output.stdout)

    expect(output.code).toBe(1)
    expect(stdout).toContain('resolves to void')
  })

  it('when a fixture guard returns a value call, the runner passes', async () => {
    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-run',
        '--allow-read',
        '--allow-env',
        'agents/style-checks/void-guard-calls.ts',
        'tests/support/fixtures/style-checks/value-guard.ts',
      ],
    })

    const output = await command.output()

    expect(output.code).toBe(0)
  })
})
