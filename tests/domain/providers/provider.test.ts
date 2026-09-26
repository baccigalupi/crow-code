import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Environment } from '../../../src/env-vars.ts'
import {
  ProviderModel,
  providerModel,
} from '../../../src/domain/providers/provider.ts'

describe('provider', () => {
  it('exposes pass-through attributes', () => {
    const environment = new Environment({})
    const provider = new ProviderModel({
      id: 1,
      name: 'provider-name',
      baseUrl: 'https://www.example.com',
      modelsPath: '/v1/models',
      apiKeyEnvVar: null,
    }, environment)

    expect(provider.id()).toBe(1)
    expect(provider.name()).toBe('provider-name')
    expect(provider.baseUrl()).toBe('https://www.example.com')
  })

  describe('modelsUrl', () => {
    it('when base url has no trailing slash and path has a leading slash, joins them with one slash', () => {
      const environment = new Environment({})
      const provider = new ProviderModel({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: '/v1/models',
        apiKeyEnvVar: null,
      }, environment)

      expect(provider.modelsUrl()).toBe('https://www.example.com/v1/models')
    })

    it('when base url has a trailing slash and path has no leading slash, joins them with one slash', () => {
      const environment = new Environment({})
      const provider = new ProviderModel({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com/',
        modelsPath: 'v1/models',
        apiKeyEnvVar: null,
      }, environment)

      expect(provider.modelsUrl()).toBe('https://www.example.com/v1/models')
    })

    it('when base url and path both have slashes, joins them with one slash', () => {
      const environment = new Environment({})
      const provider = new ProviderModel({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com/',
        modelsPath: '/v1/models',
        apiKeyEnvVar: null,
      }, environment)

      expect(provider.modelsUrl()).toBe('https://www.example.com/v1/models')
    })

    it('when models_path is null, uses the default path', () => {
      const environment = new Environment({})
      const provider = new ProviderModel({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      }, environment)

      expect(provider.modelsUrl()).toBe('https://www.example.com/v1/models')
    })
  })

  describe('apiKey', () => {
    it('returns the value from the environment variable', () => {
      const environment = new Environment({
        PROVIDER_API_KEY: 'provider-api-key',
      })
      const provider = new ProviderModel({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: 'PROVIDER_API_KEY',
      }, environment)

      expect(provider.apiKey()).toBe('provider-api-key')
    })

    it('when api_key_env_var is null, returns an empty string', () => {
      const environment = new Environment({})
      const provider = new ProviderModel({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      }, environment)

      expect(provider.apiKey()).toBe('')
    })

    it('when the environment variable is not set, returns an empty string', () => {
      const environment = new Environment({})
      const provider = new ProviderModel({
        id: 1,
        name: 'provider-name',
        baseUrl: 'https://www.example.com',
        modelsPath: null,
        apiKeyEnvVar: 'MISSING_KEY',
      }, environment)

      expect(provider.apiKey()).toBe('')
    })
  })

  describe('providerModel', () => {
    it('when given a record, returns a provider model', () => {
      const environment = new Environment({})

      const provider = providerModel({
        id: 1,
        name: 'provider-name',
        base_url: 'https://www.example.com',
        models_path: '/v1/models',
        api_key_env_var: null,
      }, environment)

      expect(provider).toBeInstanceOf(ProviderModel)
    })

    it('when the record is undefined, returns undefined', () => {
      const environment = new Environment({})

      const provider = providerModel(undefined, environment)

      expect(provider).toBeUndefined()
    })
  })
})
