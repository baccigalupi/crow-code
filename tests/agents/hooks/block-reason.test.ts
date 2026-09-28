import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { blockReason } from '../../../agents/hooks/block-reason.ts'
import { DevinConfig } from '../../../agents/hooks/devin-config.ts'

describe('blockReason', () => {
  it('when command is deno test, names dev/test', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('deno test tests/foo.test.ts', config)

    expect(result).toContain('dev/test')
  })

  it('when command is deno check, names agents/typecheck', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('deno check src/main.ts', config)

    expect(result).toContain('agents/typecheck')
  })

  it('when command is deno fmt, names agents/format-check', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('deno fmt --check', config)

    expect(result).toContain('agents/format-check')
  })

  it('when command is deno lint, names dev/lint', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('deno lint', config)

    expect(result).toContain('dev/lint')
  })

  it('when command is deno coverage, names dev/coverage', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('deno coverage', config)

    expect(result).toContain('dev/coverage')
  })

  it('when command is npm test, names dev/test', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('npm test', config)

    expect(result).toContain('dev/test')
  })

  it('when command is vitest, names dev/test', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('vitest run', config)

    expect(result).toContain('dev/test')
  })

  it('when command is unmapped, lists approved exec commands', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('make build', config)

    expect(result).toContain('dev/test')
    expect(result).toContain('agents/typecheck')
  })

  it('when command uses cd with a mapped command, names the script and workdir', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('cd /repo && deno test', config)

    expect(result).toContain('dev/test')
    expect(result).toContain('workdir')
  })

  it('when command uses cd with an approved script, names the script and workdir', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('cd /repo && agents/typecheck', config)

    expect(result).toContain('workdir')
    expect(result).toContain('agents/typecheck')
  })

  it('when command uses cd with an unmapped command, points at workdir', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('cd /repo && make build', config)

    expect(result).toContain('workdir')
    expect(result).toContain('do not use `cd`')
  })

  it('when command is blocked, instructs not to stop silently', () => {
    const json = Deno.readTextFileSync(
      'tests/support/fixtures/devin-config.json',
    )
    const config = new DevinConfig(json)

    const result = blockReason('deno test', config)

    expect(result).toContain('do not retry variants')
    expect(result).toContain('do not end your turn')
    expect(result).not.toContain('report')
  })
})
