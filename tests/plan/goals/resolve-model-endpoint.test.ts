import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { resolveModelEndpoint } from '../../../src/plan/goals/resolve-model-endpoint.ts'
import { Environment } from '../../../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import pino from 'pino'

const logger = pino({ enabled: false })

const fixtureDirectory = join(fixturesDirectory, 'resolve-model-endpoint')

describe('resolveModelEndpoint', () => {
  beforeEach(async () => {
    await clearDirectory(fixtureDirectory)
    await Deno.mkdir(fixtureDirectory, { recursive: true })
  })
  afterEach(() => clearDirectory(fixtureDirectory))

  it('when the model catalog has a cheap model on a configured provider, returns the model endpoint', () => {
    const modelCatalogPath = join(
      fixtureDirectory,
      'resolve-model-endpoint-happy.json',
    )
    Deno.writeTextFileSync(
      modelCatalogPath,
      JSON.stringify({
        fetchedAt: '2026-01-01T00:00:00.000Z',
        modelCount: 1,
        models: [
          {
            id: 'qwen3-coder:30b',
            name: 'qwen3-coder:30b',
            providers: ['nous'],
            reasoning: null,
            coding: null,
            codingSource: null,
            agentic: null,
            costInput: 0,
            costOutput: 0,
            contextLength: null,
            modality: 'local',
            reasoningMode: '-',
            knowledgeCutoff: null,
            size: '',
          },
        ],
      }),
    )
    const providers = [
      {
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        apiKeyEnv: 'NOUS_API_KEY',
      },
    ]
    const environment = new Environment({ NOUS_API_KEY: 'secret-key' })

    const modelEndpoint = resolveModelEndpoint(
      modelCatalogPath,
      providers,
      environment,
      logger,
    )

    expect(modelEndpoint).toEqual({
      baseURL: 'https://inference-api.nousresearch.com/v1',
      apiKey: 'secret-key',
      model: 'qwen3-coder:30b',
    })
  })

  it('when the model catalog file is missing, returns null', () => {
    const modelCatalogPath = join(
      fixtureDirectory,
      'resolve-model-endpoint-missing.json',
    )
    const providers = [
      {
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        apiKeyEnv: 'NOUS_API_KEY',
      },
    ]
    const environment = new Environment({ NOUS_API_KEY: 'secret-key' })

    const modelEndpoint = resolveModelEndpoint(
      modelCatalogPath,
      providers,
      environment,
      logger,
    )

    expect(modelEndpoint).toBeNull()
  })

  it('when the model catalog has no cheap no-reasoning models, returns null', () => {
    const modelCatalogPath = join(
      fixtureDirectory,
      'resolve-model-endpoint-empty.json',
    )
    Deno.writeTextFileSync(
      modelCatalogPath,
      JSON.stringify({
        fetchedAt: '2026-01-01T00:00:00.000Z',
        modelCount: 1,
        models: [
          {
            id: 'deepseek-reasoning',
            name: 'DeepSeek R1',
            providers: ['nous'],
            reasoning: 80,
            coding: 70,
            codingSource: 'AA',
            agentic: 60,
            costInput: 0,
            costOutput: 0,
            contextLength: 1000,
            modality: 'text->text',
            reasoningMode: 'on',
            knowledgeCutoff: null,
            size: '',
          },
        ],
      }),
    )
    const providers = [
      {
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        apiKeyEnv: 'NOUS_API_KEY',
      },
    ]
    const environment = new Environment({ NOUS_API_KEY: 'secret-key' })

    const modelEndpoint = resolveModelEndpoint(
      modelCatalogPath,
      providers,
      environment,
      logger,
    )

    expect(modelEndpoint).toBeNull()
  })

  it('when the model provider is not configured, returns null', () => {
    const modelCatalogPath = join(
      fixtureDirectory,
      'resolve-model-endpoint-unknown.json',
    )
    Deno.writeTextFileSync(
      modelCatalogPath,
      JSON.stringify({
        fetchedAt: '2026-01-01T00:00:00.000Z',
        modelCount: 1,
        models: [
          {
            id: 'qwen3-coder:30b',
            name: 'qwen3-coder:30b',
            providers: ['nous'],
            reasoning: null,
            coding: null,
            codingSource: null,
            agentic: null,
            costInput: 0,
            costOutput: 0,
            contextLength: null,
            modality: 'local',
            reasoningMode: '-',
            knowledgeCutoff: null,
            size: '',
          },
        ],
      }),
    )
    const providers = [
      {
        name: 'openrouter',
        baseUrl: 'https://openrouter.ai/api',
        apiKeyEnv: 'OPENROUTER_API_KEY',
      },
    ]
    const environment = new Environment({ OPENROUTER_API_KEY: 'secret-key' })

    const modelEndpoint = resolveModelEndpoint(
      modelCatalogPath,
      providers,
      environment,
      logger,
    )

    expect(modelEndpoint).toBeNull()
  })

  it('when the provider api key env var is unset, returns null', () => {
    const modelCatalogPath = join(
      fixtureDirectory,
      'resolve-model-endpoint-nokey.json',
    )
    Deno.writeTextFileSync(
      modelCatalogPath,
      JSON.stringify({
        fetchedAt: '2026-01-01T00:00:00.000Z',
        modelCount: 1,
        models: [
          {
            id: 'qwen3-coder:30b',
            name: 'qwen3-coder:30b',
            providers: ['nous'],
            reasoning: null,
            coding: null,
            codingSource: null,
            agentic: null,
            costInput: 0,
            costOutput: 0,
            contextLength: null,
            modality: 'local',
            reasoningMode: '-',
            knowledgeCutoff: null,
            size: '',
          },
        ],
      }),
    )
    const providers = [
      {
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        apiKeyEnv: 'NOUS_API_KEY',
      },
    ]
    const environment = new Environment({})

    const modelEndpoint = resolveModelEndpoint(
      modelCatalogPath,
      providers,
      environment,
      logger,
    )

    expect(modelEndpoint).toBeNull()
  })

  it('when the provider has no api key env var, uses an unused key', () => {
    const modelCatalogPath = join(
      fixtureDirectory,
      'resolve-model-endpoint-local.json',
    )
    Deno.writeTextFileSync(
      modelCatalogPath,
      JSON.stringify({
        fetchedAt: '2026-01-01T00:00:00.000Z',
        modelCount: 1,
        models: [
          {
            id: 'qwen3-coder:30b',
            name: 'qwen3-coder:30b',
            providers: ['ollama'],
            reasoning: null,
            coding: null,
            codingSource: null,
            agentic: null,
            costInput: 0,
            costOutput: 0,
            contextLength: null,
            modality: 'local',
            reasoningMode: '-',
            knowledgeCutoff: null,
            size: '',
          },
        ],
      }),
    )
    const providers = [
      {
        name: 'ollama',
        baseUrl: 'http://pile-driver.local:11434',
        modelsUrl: 'http://pile-driver.local:11434/api/tags',
      },
    ]
    const environment = new Environment({})

    const modelEndpoint = resolveModelEndpoint(
      modelCatalogPath,
      providers,
      environment,
      logger,
    )

    expect(modelEndpoint).toEqual({
      baseURL: 'http://pile-driver.local:11434/v1',
      apiKey: 'unused',
      model: 'qwen3-coder:30b',
    })
  })
})
