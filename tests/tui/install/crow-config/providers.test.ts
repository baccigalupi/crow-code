import { describe, expect, it } from 'bun:test'
import { providerEnvVar } from '../../../../src/tui/install/crow-config/providers.ts'

describe('providerEnvVar', () => {
  it('derives upper snake api key var', () => {
    const name = 'Open Router'

    const envVar = providerEnvVar(name)

    expect(envVar).toBe('OPEN_ROUTER_API_KEY')
  })
})
