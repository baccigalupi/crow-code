import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalizeParamKeys } from '../../../../src/domain/parsers/parse-params/normalize-param-keys.ts'

describe('normalizeParamKeys', () => {
  it('when keys are mixed case, returns snake_case keys with values preserved', () => {
    const params = {
      'base-url': 'https://www.example.com',
      apiKeyEnvVar: 'PROVIDER_API_KEY',
      name: 'provider-name',
    }

    const result = normalizeParamKeys(params)

    expect(result).toEqual({
      base_url: 'https://www.example.com',
      api_key_env_var: 'PROVIDER_API_KEY',
      name: 'provider-name',
    })
  })
})
