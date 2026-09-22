import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../../../src/model-info/types.ts'
import { resolveModelEndpoint } from '../../../src/tools/git-commit/endpoint.ts'

describe('endpoint', () => {
  it('when configuration cannot be loaded, logs and returns an empty endpoint', () => {
    const crowDirectory = Deno.makeTempDirSync()
    const messages: string[] = []
    const logger = {
      error: (message: unknown) => messages.push(String(message)),
    } as unknown as Logger

    const endpoint = resolveModelEndpoint(crowDirectory, logger)

    expect(endpoint).toEqual({ baseURL: '', apiKey: '', model: '' })
    expect(messages[0]).toBe('Commit summary configuration could not be loaded')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when the provider has no API key environment, logs and returns an empty endpoint', () => {
    const crowDirectory = Deno.makeTempDirSync()
    const model = {
      id: 'first-model',
      name: 'First Model',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }
    Deno.writeTextFileSync(
      join(crowDirectory, 'models.json'),
      JSON.stringify({ fetchedAt: '', modelCount: 1, models: [model] }),
    )
    Deno.writeTextFileSync(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{ name: 'nous', baseUrl: 'https://nous.example/v1' }],
      }),
    )
    const messages: string[] = []
    const logger = {
      error: (message: unknown) => messages.push(String(message)),
    } as unknown as Logger

    const endpoint = resolveModelEndpoint(crowDirectory, logger)

    expect(endpoint).toEqual({ baseURL: '', apiKey: '', model: '' })
    expect(messages[0]).toBe(
      'No API key is configured for the commit summary provider',
    )
    Deno.removeSync(crowDirectory, { recursive: true })
  })
})
