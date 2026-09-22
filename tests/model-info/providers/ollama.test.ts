import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import {
  fetchOllamaModels,
  parseOllamaResponse,
} from '../../../src/model-info/providers/ollama.ts'

describe('ollama', () => {
  it('when the body has models, parseOllamaResponse normalizes them into records', () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const body = {
      models: [{ name: 'qwen3-coder:30b' }],
    }

    const result = parseOllamaResponse(body, ollamaConfig)

    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
  })

  it('when fetched, fetchOllamaModels returns normalized records', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    const result = await fetchOllamaModels(ollamaConfig, logger, mockFetch)

    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
  })

  it('when fetched with modelsUrl omitted, falls back to baseUrl/api/tags', async () => {
    const configWithoutModelsUrl = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    const result = await fetchOllamaModels(
      configWithoutModelsUrl,
      logger,
      mockFetch,
    )

    expect(result[0].id).toBe('qwen3-coder:30b')
  })

  it('when the network request fails, fetchOllamaModels returns an empty list', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchOllamaModels(ollamaConfig, logger, mockFetch)

    expect(result).toEqual([])
  })

  it('when inspecting live models, reports their reasoning metadata', {
    skip: Deno.env.get('OLLAMA_LIVE_TEST') !== '1',
  }, async () => {
    const models = ['qwen3-coder:30b', 'laguna-xs-2.1:latest', 'gemma4:26b']

    const responses = await Promise.all(models.map(async (model) => {
      const response = await fetch('http://pile-driver.local:11434/api/show', {
        method: 'POST',
        body: JSON.stringify({ model }),
      })
      const data = await response.json()
      return {
        model,
        capabilities: data.capabilities,
        parameters: data.parameters,
      }
    }))

    console.log(JSON.stringify(responses, null, 2))
    expect(responses).toHaveLength(3)
  })

  it('when changing think, reports live reasoning behavior', {
    skip: Deno.env.get('OLLAMA_LIVE_TEST') !== '1',
  }, async () => {
    const models = ['laguna-xs-2.1:latest', 'gemma4:26b']
    const settings: Array<boolean | string> = [
      false,
      true,
      'low',
      'medium',
      'high',
      'max',
    ]
    const requests = models.flatMap((model) =>
      settings.map((think) => ({ model, think }))
    )

    const responses = await Promise.all(
      requests.map(async ({ model, think }) => {
        const response = await fetch(
          'http://pile-driver.local:11434/api/chat',
          {
            method: 'POST',
            body: JSON.stringify({
              model,
              think,
              stream: false,
              messages: [{
                role: 'user',
                content: 'What is 2+2? Reply only 4.',
              }],
              options: { num_predict: 128 },
            }),
          },
        )
        const data = await response.json()
        return {
          model,
          think,
          status: response.status,
          thinking: data.message && data.message.thinking,
          content: data.message && data.message.content,
          error: data.error,
        }
      }),
    )

    console.log(JSON.stringify(responses, null, 2))
    expect(responses).toHaveLength(12)
  })
})
