import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { Environment } from '../../../src/env-vars.ts'
import { ProviderEntity } from '../../../src/domain/providers/entity.ts'
import { providerFindAll } from '../../../src/domain/providers/find-all.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('providerFindAll', () => {
  describe('all', () => {
    it('returns every provider as a ProviderEntity', async () => {
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
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const providers = await providerFindAll(applicationData).all()

      const [first, second] = providers
      expect(providers).toHaveLength(2)
      expect(first).toBeInstanceOf(ProviderEntity)
      expect(first.name()).toBe('provider-one')
      expect(first.baseUrl()).toBe('https://www.example.com/one')
      expect(first.apiKey()).toBe('secret')
      expect(second).toBeInstanceOf(ProviderEntity)
      expect(second.name()).toBe('provider-two')
      await database.destroy()
    })

    it('returns an empty array when there are no providers', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const providers = await providerFindAll(applicationData).all()

      expect(providers).toEqual([])
      await database.destroy()
    })

    it('returns an empty api key when the env var is unset', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert({
        name: 'provider-name',
        base_url: 'https://www.example.com',
        models_path: '/models',
        api_key_env_var: 'MISSING_KEY',
      })
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const providers = await providerFindAll(applicationData).all()

      expect(providers).toHaveLength(1)
      expect(providers[0].apiKey()).toBe('')
      await database.destroy()
    })
  })
})
