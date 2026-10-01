import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Environment } from '../../../src/env-vars.ts'
import {
  ProviderEntity,
  providerEntity,
} from '../../../src/domain/providers/entity.ts'

describe('provider', () => {
  it('exposes pass-through attributes', () => {
    const environment = new Environment({})
    const provider = new ProviderEntity({
      id: 1,
      name: 'provider-name',
      baseUrl: 'https://www.example.com',
      modelsPath: '/v1/models',
      apiKeyEnvVar: null,
    }, environment)

    const id = provider.id()
    const name = provider.name()
    const baseUrl = provider.baseUrl()

    expect(id).toBe(1)
    expect(name).toBe('provider-name')
    expect(baseUrl).toBe('https://www.example.com')
  })

  describe('modelsUrl', () => {
    it('when base url has no trailing slash and path has a leading slash, joins them with one slash', () => {
      const environment = new Environment({})
      const provider = new ProviderEntity({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: '/v1/models',
        apiKeyEnvVar: null,
      }, environment)

      const url = provider.modelsUrl()

      expect(url).toBe('https://www.example.com/v1/models')
    })

    it('when base url has a trailing slash and path has no leading slash, joins them with one slash', () => {
      const environment = new Environment({})
      const provider = new ProviderEntity({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com/',
        modelsPath: 'v1/models',
        apiKeyEnvVar: null,
      }, environment)

      const url = provider.modelsUrl()

      expect(url).toBe('https://www.example.com/v1/models')
    })

    it('when base url and path both have slashes, joins them with one slash', () => {
      const environment = new Environment({})
      const provider = new ProviderEntity({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com/',
        modelsPath: '/v1/models',
        apiKeyEnvVar: null,
      }, environment)

      const url = provider.modelsUrl()

      expect(url).toBe('https://www.example.com/v1/models')
    })

    it('when models_path is null, uses the default path', () => {
      const environment = new Environment({})
      const provider = new ProviderEntity({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      }, environment)

      const url = provider.modelsUrl()

      expect(url).toBe('https://www.example.com/v1/models')
    })
  })

  describe('apiKey', () => {
    it('returns the value from the environment variable', () => {
      const environment = new Environment({
        PROVIDER_API_KEY: 'provider-api-key',
      })
      const provider = new ProviderEntity({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: 'PROVIDER_API_KEY',
      }, environment)

      const key = provider.apiKey()

      expect(key).toBe('provider-api-key')
    })

    it('when api_key_env_var is null, returns an empty string', () => {
      const environment = new Environment({})
      const provider = new ProviderEntity({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      }, environment)

      const key = provider.apiKey()

      expect(key).toBe('')
    })

    it('when the environment variable is not set, returns an empty string', () => {
      const environment = new Environment({})
      const provider = new ProviderEntity({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: 'MISSING_KEY',
      }, environment)

      const key = provider.apiKey()

      expect(key).toBe('')
    })
  })

  describe('providerEntity', () => {
    it('when given a record, returns a provider entity', () => {
      const environment = new Environment({})

      const provider = providerEntity({
        id: 1,
        name: 'provider-name',
        base_url: 'https://www.example.com',
        models_path: '/v1/models',
        api_key_env_var: null,
      }, environment)

      expect(provider).toBeInstanceOf(ProviderEntity)
    })

    it('when the record is undefined, returns undefined', () => {
      const environment = new Environment({})

      const provider = providerEntity(undefined, environment)

      expect(provider).toBeUndefined()
    })

    it('when given a record, normalizes the record fields', () => {
      const environment = new Environment({})

      const provider = providerEntity({
        id: 2,
        name: 'other-provider',
        base_url: 'https://api.example.com/',
        models_path: 'models',
        api_key_env_var: null,
      }, environment) as ProviderEntity

      expect(provider.name()).toBe('other-provider')
      expect(provider.modelsUrl()).toBe('https://api.example.com/models')
    })
  })
})
