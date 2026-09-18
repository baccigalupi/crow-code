import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { loadProviderConfig } from '../../../src/model-discovery/providers/load-provider-config.ts'

const crowDirectory = join(Deno.cwd(), 'tests', 'support', 'fixtures', '.crow')

describe('loadProviderConfig', () => {
  it('when the crow directory contains providers.json, returns the parsed providers', () => {
    const providersPath = join(crowDirectory, 'providers.json')
    Deno.mkdirSync(crowDirectory, { recursive: true })
    Deno.writeTextFileSync(
      providersPath,
      JSON.stringify({
        providers: [
          { name: 'nous', baseUrl: 'https://inference-api.nousresearch.com' },
        ],
      }),
    )

    const providers = loadProviderConfig(crowDirectory)

    expect(providers).toEqual([
      { name: 'nous', baseUrl: 'https://inference-api.nousresearch.com' },
    ])

    Deno.removeSync(providersPath)
  })
})
