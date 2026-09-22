import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { DevinConfig } from '../../../agents/hooks/devin-config.ts'

const json = Deno.readTextFileSync('tests/support/fixtures/devin-config.json')

describe('DevinConfig', () => {
  it('when an agents script is allowed, returns true', () => {
    const config = new DevinConfig(json)

    const result = config.allowsExec('agents/typecheck')

    expect(result).toBe(true)
  })

  it('when a dev command extends an allowed prefix, returns true', () => {
    const config = new DevinConfig(json)

    const result = config.allowsExec('dev/test tests/cli.test.ts')

    expect(result).toBe(true)
  })

  it('when an agents script is absent, returns false', () => {
    const config = new DevinConfig(json)

    const result = config.allowsExec('agents/random-script')

    expect(result).toBe(false)
  })

  it('when a dev script is absent, returns false', () => {
    const config = new DevinConfig(json)

    const result = config.allowsExec('dev/random-script')

    expect(result).toBe(false)
  })

  it('when a deny rule also matches an allow rule, returns false', () => {
    const config = new DevinConfig(
      '{"permissions":{"allow":["Exec(git)"],"deny":["Exec(git push)"]}}',
    )

    const result = config.allowsExec('git push origin main')

    expect(result).toBe(false)
  })

  it('when a Fetch rule matches the command text, returns false', () => {
    const config = new DevinConfig(
      '{"permissions":{"allow":["Fetch(domain:docs.devin.ai)"],"deny":[]}}',
    )

    const result = config.allowsExec('domain:docs.devin.ai')

    expect(result).toBe(false)
  })
})
