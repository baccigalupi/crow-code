import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  defaultModelCatalogPath,
  readModelCatalog,
  writeModelCatalog,
} from '../../../src/model-discovery/catalog/model-catalog.ts'
import type { ModelInfo } from '../../../src/model-discovery/types.ts'
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
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0.5,
      costOutput: 1.5,
      contextLength: 128000,
      modality: 'text->text',
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
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0.5,
      costOutput: 1.5,
      contextLength: 128000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }

    writeModelCatalog(path, [model])

    const saved = JSON.parse(Deno.readTextFileSync(path))
    expect(saved.modelCount).toBe(1)
    expect(saved.sources).toBeUndefined()
  })

  it('when reading, returns the written catalog', () => {
    const path = join(
      'tests',
      'support',
      'fixtures',
      '.crow',
      'model-catalog-read-test.json',
    )
    const model: ModelInfo = {
      id: 'deepseek/deepseek-chat',
      name: 'deepseek-chat',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0.5,
      costOutput: 1.5,
      contextLength: 128000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }

    writeModelCatalog(path, [model])
    const catalog = readModelCatalog(path)

    expect(catalog.models).toEqual([model])
    expect(catalog.modelCount).toBe(1)
  })

  it('when asking for the default path, returns models.json inside the given directory', () => {
    const crowDirectory = 'tests/support/fixtures/.crow'

    const result = defaultModelCatalogPath(crowDirectory)

    expect(result).toBe('tests/support/fixtures/.crow/models.json')
  })
})
