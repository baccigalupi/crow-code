import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { loadProviderConfig } from '../../../src/model-info/providers/load-provider-config.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

const crowDirectory = join(fixturesDirectory, 'load-provider-config', '.crow')

describe('loadProviderConfig', () => {
  beforeEach(async () => {
    await clearDirectory(crowDirectory)
    await Deno.mkdir(crowDirectory, { recursive: true })
  })
  afterEach(() => clearDirectory(crowDirectory))

  it('when the crow directory contains providers.json, returns the parsed providers', () => {
    const providersPath = join(crowDirectory, 'providers.json')
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
  })
})
