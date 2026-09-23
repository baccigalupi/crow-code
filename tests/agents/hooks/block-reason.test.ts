import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { blockReason } from '../../../agents/hooks/block-reason.ts'
import { DevinConfig } from '../../../agents/hooks/devin-config.ts'

const json = Deno.readTextFileSync('tests/support/fixtures/devin-config.json')

describe('blockReason', () => {
  it('when command is deno test, names dev/test', () => {
    const config = new DevinConfig(json)

    const result = blockReason('deno test tests/foo.test.ts', config)

    expect(result).toContain('dev/test')
  })

  it('when command is deno check, names agents/typecheck', () => {
    const config = new DevinConfig(json)

    const result = blockReason('deno check src/main.ts', config)

    expect(result).toContain('agents/typecheck')
  })

  it('when command is deno fmt, names agents/format-check', () => {
    const config = new DevinConfig(json)

    const result = blockReason('deno fmt --check', config)

    expect(result).toContain('agents/format-check')
  })

  it('when command is deno lint, names dev/lint', () => {
    const config = new DevinConfig(json)

    const result = blockReason('deno lint', config)

    expect(result).toContain('dev/lint')
  })

  it('when command is deno coverage, names dev/coverage', () => {
    const config = new DevinConfig(json)

    const result = blockReason('deno coverage', config)

    expect(result).toContain('dev/coverage')
  })

  it('when command is npm test, names dev/test', () => {
    const config = new DevinConfig(json)

    const result = blockReason('npm test', config)

    expect(result).toContain('dev/test')
  })

  it('when command is vitest, names dev/test', () => {
    const config = new DevinConfig(json)

    const result = blockReason('vitest run', config)

    expect(result).toContain('dev/test')
  })

  it('when command is unmapped, lists approved exec commands', () => {
    const config = new DevinConfig(json)

    const result = blockReason('make build', config)

    expect(result).toContain('dev/test')
    expect(result).toContain('agents/typecheck')
  })

  it('when command is blocked, instructs not to stop silently', () => {
    const config = new DevinConfig(json)

    const result = blockReason('deno test', config)

    expect(result).toContain('do not retry variants')
    expect(result).toContain('reporting the block')
  })
})
