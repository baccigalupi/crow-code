import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  defaultModelCatalogPath,
  writeModelCatalog,
} from '../../src/model-info/model-catalog.ts'
import type { ModelInfo } from '../../src/model-info/types.ts'
import { join } from '@std/path'

describe('modelCatalog', () => {
  it('when writing, creates the file with the models', () => {
    const path = join(
      'tests',
      'support',
      'fixtures',
      '.crow',
      'model-catalog-write-test.json',
    )

    const model: ModelInfo = {
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

    writeModelCatalog(path, [model])

    const saved = JSON.parse(Deno.readTextFileSync(path))
    expect(saved.models).toEqual([model])
  })

  it('when writing, records the model count', () => {
    const path = join(
      'tests',
      'support',
      'fixtures',
      '.crow',
      'model-catalog-count-test.json',
    )
    const model: ModelInfo = {
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

    writeModelCatalog(path, [model])

    const saved = JSON.parse(Deno.readTextFileSync(path))
    expect(saved.modelCount).toBe(1)
    expect(saved.sources).toBeUndefined()
  })

  it('when asking for the default path, returns models.json inside the given directory', () => {
    const result = defaultModelCatalogPath('tests/support/fixtures/.crow')

    expect(result).toBe('tests/support/fixtures/.crow/models.json')
  })
})
