import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { Environment } from '../../../src/env-vars.ts'
import { ProviderModel } from '../../../src/domain/providers/provider.ts'
import { providerFindAll } from '../../../src/domain/providers/find-all.ts'
import { createTestDatabase } from '../../support/test-database.ts'

describe('providerFindAll', () => {
  describe('all', () => {
    it('returns every provider as a ProviderModel', async () => {
      const environment = new Environment({ PROVIDER_API_KEY: 'secret' })
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert([
        {
          name: 'provider-one',
          base_url: 'https://www.example.com/one',
          models_path: '/models',
          api_key_env_var: 'PROVIDER_API_KEY',
        },
        {
          name: 'provider-two',
          base_url: 'https://www.example.com/two',
          models_path: '/models',
          api_key_env_var: 'PROVIDER_API_KEY',
        },
      ])

      const providers = await providerFindAll(environment, database, logger)
        .all()

      const [first, second] = providers
      expect(providers).toHaveLength(2)
      expect(first).toBeInstanceOf(ProviderModel)
      expect(first.name()).toBe('provider-one')
      expect(first.baseUrl()).toBe('https://www.example.com/one')
      expect(first.apiKey()).toBe('secret')
      expect(second).toBeInstanceOf(ProviderModel)
      expect(second.name()).toBe('provider-two')
      await database.destroy()
    })

    it('returns an empty array when there are no providers', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)

      const providers = await providerFindAll(environment, database, logger)
        .all()

      expect(providers).toEqual([])
      await database.destroy()
    })
  })
})
