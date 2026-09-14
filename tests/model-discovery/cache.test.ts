import { describe, it, expect, afterEach } from 'vitest'
import { defaultCachePath, writeCache } from '../../src/model-discovery/cache'
import { ModelRecord } from '../../src/model-discovery/types'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tempDirs: string[] = []

afterEach(() => {
  tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
  tempDirs.length = 0
})

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

describe('cache', () => {
  it('when writing, creates the file with the models', () => {
    const dir = mkdtempSync(join(tmpdir(), 'crow-code-cache-'))
    tempDirs.push(dir)
    const path = join(dir, 'models.json')

    writeCache(path, [model])

    const saved = JSON.parse(readFileSync(path, 'utf8'))
    expect(saved.models).toEqual([model])
  })

  it('when asking for the default path, returns the .crow cache location', () => {
    const result = defaultCachePath('/tmp/project')

    expect(result).toBe('/tmp/project/.crow/models.json')
  })
})
