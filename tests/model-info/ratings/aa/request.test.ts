import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { aaModelsRequest } from '../../../../src/model-info/ratings/aa/request.ts'

describe('aaModelsRequest', () => {
  it('when given a page, targets that page of the models endpoint', () => {
    const result = aaModelsRequest(2, 'test-key')

    expect(result.url).toBe(
      'https://artificialanalysis.ai/api/v2/language/models/free?page=2',
    )
  })

  it('when given a key, sets the api key header', () => {
    const result = aaModelsRequest(1, 'test-key')

    expect(result.headers.get('x-api-key')).toBe('test-key')
  })
})
