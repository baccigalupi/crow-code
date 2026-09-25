import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { filterKeys } from '../../../../src/domain/parsers/parse-params/filter-keys.ts'

describe('filterKeys', () => {
  it('when keys are not in the allowed list, removes them', () => {
    const params = {
      name: 'name',
      dateOfBirth: 'date-of-birth',
      extra: 'extra',
    }
    const allowedKeys = ['name', 'dateOfBirth']

    const result = filterKeys(params, allowedKeys)

    expect(result).toEqual({ name: 'name', dateOfBirth: 'date-of-birth' })
  })

  it('when all keys are in the allowed list, returns the params unchanged', () => {
    const params = { name: 'name', dateOfBirth: 'date-of-birth' }
    const allowedKeys = ['name', 'dateOfBirth']

    const result = filterKeys(params, allowedKeys)

    expect(result).toEqual(params)
  })

  it('when no keys are in the allowed list, returns an empty object', () => {
    const params = { extra: 'extra' }
    const allowedKeys = ['name', 'dateOfBirth']

    const result = filterKeys(params, allowedKeys)

    expect(result).toEqual({})
  })
})
