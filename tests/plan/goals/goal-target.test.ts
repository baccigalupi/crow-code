import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { resolveGoalTarget } from '../../../src/plan/goals/goal-target.ts'
import { Environment } from '../../../src/env-vars.ts'

const fixtureDirectory = join(
  Deno.cwd(),
  'tests',
  'support',
  'fixtures',
  '.crow',
)

describe('resolveGoalTarget', () => {
  it('when the cache has a cheap model on a configured provider, returns the target', () => {
    const cachePath = join(fixtureDirectory, 'goal-target-happy.json')
    Deno.mkdirSync(fixtureDirectory, { recursive: true })
    Deno.writeTextFileSync(
      cachePath,
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

    const target = resolveGoalTarget(cachePath, providers, environment)

    expect(target).toEqual({
      baseURL: 'https://inference-api.nousresearch.com/v1',
      apiKey: 'secret-key',
      model: 'qwen3-coder:30b',
    })

    Deno.removeSync(cachePath)
  })

  it('when the cache file is missing, returns null', () => {
    const cachePath = join(fixtureDirectory, 'goal-target-missing.json')
    const providers = [
      {
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        apiKeyEnv: 'NOUS_API_KEY',
      },
    ]
    const environment = new Environment({ NOUS_API_KEY: 'secret-key' })

    const target = resolveGoalTarget(cachePath, providers, environment)

    expect(target).toBeNull()
  })

  it('when the cache has no cheap no-reasoning models, returns null', () => {
    const cachePath = join(fixtureDirectory, 'goal-target-empty.json')
    Deno.mkdirSync(fixtureDirectory, { recursive: true })
    Deno.writeTextFileSync(
      cachePath,
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

    const target = resolveGoalTarget(cachePath, providers, environment)

    expect(target).toBeNull()

    Deno.removeSync(cachePath)
  })

  it('when the model provider is not configured, returns null', () => {
    const cachePath = join(fixtureDirectory, 'goal-target-unknown.json')
    Deno.mkdirSync(fixtureDirectory, { recursive: true })
    Deno.writeTextFileSync(
      cachePath,
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

    const target = resolveGoalTarget(cachePath, providers, environment)

    expect(target).toBeNull()

    Deno.removeSync(cachePath)
  })

  it('when the provider api key env var is unset, returns null', () => {
    const cachePath = join(fixtureDirectory, 'goal-target-nokey.json')
    Deno.mkdirSync(fixtureDirectory, { recursive: true })
    Deno.writeTextFileSync(
      cachePath,
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

    const target = resolveGoalTarget(cachePath, providers, environment)

    expect(target).toBeNull()

    Deno.removeSync(cachePath)
  })

  it('when the provider has no api key env var, uses an unused key', () => {
    const cachePath = join(fixtureDirectory, 'goal-target-local.json')
    Deno.mkdirSync(fixtureDirectory, { recursive: true })
    Deno.writeTextFileSync(
      cachePath,
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

    const target = resolveGoalTarget(cachePath, providers, environment)

    expect(target).toEqual({
      baseURL: 'http://pile-driver.local:11434/v1',
      apiKey: 'unused',
      model: 'qwen3-coder:30b',
    })

    Deno.removeSync(cachePath)
  })
})
