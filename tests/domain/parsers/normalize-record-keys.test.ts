import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalizeRecordKeys } from '../../../src/domain/parsers/normalize-record-keys.ts'

describe('normalizeRecordKeys', () => {
  it('when keys are mixed case, returns snake_case keys with values preserved', () => {
    const params = {
      'base-url': 'https://www.example.com',
      apiKeyEnvVar: 'PROVIDER_API_KEY',
      name: 'provider-name',
    }

    const result = normalizeRecordKeys(params)

    expect(result).toEqual({
      base_url: 'https://www.example.com',
      api_key_env_var: 'PROVIDER_API_KEY',
      name: 'provider-name',
    })
  })
})
