import { describe, it, expect, afterEach } from 'vitest'
import {
  defaultCachePath,
  readCache,
  writeCache,
} from '../../src/model-discovery/cache'
import { ModelRecord } from '../../src/model-discovery/types'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tempDirs: string[] = []

afterEach(() => {
  tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
  tempDirs.length = 0
})

describe('cache', () => {
  it('when reading a missing file, returns null', () => {
    const dir = mkdtempSync(join(tmpdir(), 'crow-code-cache-'))
    tempDirs.push(dir)

    const result = readCache(join(dir, 'models.json'))

    expect(result).toBeNull()
  })

  it('when writing then reading, returns the models', () => {
    const dir = mkdtempSync(join(tmpdir(), 'crow-code-cache-'))
    tempDirs.push(dir)
    const path = join(dir, 'models.json')
    const model: ModelRecord = {
      id: 'deepseek/deepseek-chat',
      name: 'deepseek-chat',
      providers: ['nous'],
      reasoning: 70,
      coding: 60,
      codingSource: 'AA',
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

    const result = readCache(path)

    expect(result).not.toBeNull()
    expect(result?.models).toEqual([model])
  })

  it('when asking for the default path, returns the .crow cache location', () => {
    const result = defaultCachePath()

    expect(result.endsWith('.crow/models.json')).toBe(true)
  })

  it('when the file is not valid JSON, returns null', () => {
    const dir = mkdtempSync(join(tmpdir(), 'crow-code-cache-'))
    tempDirs.push(dir)
    const path = join(dir, 'models.json')
    writeFileSync(path, 'not json')

    const result = readCache(path)

    expect(result).toBeNull()
  })
})
