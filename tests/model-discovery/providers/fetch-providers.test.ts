import { describe, it, expect } from 'vitest'
import { fetchProviders } from '../../../src/model-discovery/providers/fetch-providers'
import type { ProviderConfig } from '../../../src/model-discovery/types'

describe('fetchProviders', () => {
  it('when the provider name is unknown, returns an empty list', async () => {
    const config: ProviderConfig = {
      name: 'unknown',
      baseUrl: 'http://example.com',
    }

    const result = await fetchProviders(config)

    expect(result).toEqual([])
  })
})
