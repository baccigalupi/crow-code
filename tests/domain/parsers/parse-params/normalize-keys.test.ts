import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalize } from '../../../../src/domain/parsers/parse-params/normalize-keys.ts'

describe('normalize', () => {
  it('when the key is kebab-case, returns the snake_case key', () => {
    const key = 'api-key-env-var'

    const result = normalize(key)

    expect(result).toBe('api_key_env_var')
  })

  it('when the key is camelCase, returns the snake_case key', () => {
    const key = 'apiKeyEnvVar'

    const result = normalize(key)

    expect(result).toBe('api_key_env_var')
  })

  it('when the key matches nothing, returns the key unchanged', () => {
    const key = 'Bad_Key'

    const result = normalize(key)

    expect(result).toBe('Bad_Key')
  })
})
