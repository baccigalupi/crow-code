import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalizeModelKeys } from '../../../src/domain/parsers/normalize-model-keys.ts'

describe('normalizeModelKeys', () => {
  it('converts snake_case record keys to camelCase', () => {
    const record = {
      provider_id: 1,
      context_length: 128000,
      supported_parameters: ['temperature'],
    }

    const result = normalizeModelKeys(record)

    expect(result).toEqual({
      providerId: 1,
      contextLength: 128000,
      supportedParameters: ['temperature'],
    })
  })
})
