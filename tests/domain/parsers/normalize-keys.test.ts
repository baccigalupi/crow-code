import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalize } from '../../../src/domain/parsers/normalize-keys.ts'

describe('normalize', () => {
  it('when the key is kebab-case, returns the snake_case key', () => {
    const result = normalize('api-key-env-var')

    expect(result).toBe('api_key_env_var')
  })

  it('when the key is camelCase, returns the snake_case key', () => {
    const result = normalize('apiKeyEnvVar')

    expect(result).toBe('api_key_env_var')
  })

  it('when the key matches nothing, returns the key unchanged', () => {
    const result = normalize('Bad_Key')

    expect(result).toBe('Bad_Key')
  })
})
