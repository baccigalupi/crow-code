import { describe, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import {
  defaultCachePath,
  writeCache,
} from '../../src/model-discovery/cache.ts'
import { ModelRecord } from '../../src/model-discovery/types.ts'
import { join } from '@std/path'

describe('cache', () => {
  it('when writing, creates the file with the models', () => {
    const path = join(
      'tests',
      'support',
      'fixtures',
      '.crow',
      'cache-write-test.json',
    )

    const model: ModelRecord = {
      id: 'deepseek/deepseek-chat',
      name: 'deepseek-chat',
      providers: ['nous', 'ollama'],
      reasoning: 70,
      coding: 60,
      codingSource: 'AA' as const,
      agentic: 50,
      costInput: 0.5,
      costOutput: 1.5,
      contextLength: 128000,
      modality: 'text->text',
      reasoningMode: 'off',
      knowledgeCutoff: null,
      size: '',
    }

    writeCache(path, [model])

    const saved = JSON.parse(Deno.readTextFileSync(path))
    expect(saved.models).toEqual([model])
  })

  it('when asking for the default path, returns the .crow cache location', () => {
    const result = defaultCachePath('tests/support/fixtures')

    expect(result).toBe('tests/support/fixtures/.crow/models.json')
  })
})
