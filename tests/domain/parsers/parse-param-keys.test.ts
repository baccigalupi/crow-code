import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parseParamKeys } from '../../../src/domain/parsers/parse-param-keys.ts'

describe('parseParamKeys', () => {
  it('when keys are mixed case and some are allowed, normalizes and filters them', () => {
    const params = {
      name: 'provider-name',
      dateOfBirth: '1990-01-01',
      extra: 'extra',
    }
    const allowedKeys = ['name', 'date_of_birth']

    const result = parseParamKeys(params, allowedKeys)

    expect(result).toEqual({
      name: 'provider-name',
      date_of_birth: '1990-01-01',
    })
  })

  it('when no keys are allowed, returns an empty object', () => {
    const params = { extra: 'extra' }
    const allowedKeys = ['name', 'date_of_birth']

    const result = parseParamKeys(params, allowedKeys)

    expect(result).toEqual({})
  })
})
