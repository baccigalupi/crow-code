import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatContext,
  formatCost,
  formatScore,
  padLeft,
  padRight,
  renderJson,
  renderTable,
} from '../../src/model-discovery/render'
import { CacheFile, ModelRecord } from '../../src/model-discovery/types'

const model: ModelRecord = {
  id: 'deepseek/deepseek-chat',
  name: 'DeepSeek Chat',
  providers: ['nous'],
  reasoning: 40,
  coding: 60,
  codingSource: 'AA',
  agentic: 30,
  costInput: 0.5,
  costOutput: 1.5,
  contextLength: 1000,
  modality: 'text->text',
  reasoningMode: 'off',
  knowledgeCutoff: null,
  size: '',
}

const cache: CacheFile = {
  fetchedAt: '2026-01-01T00:00:00.000Z',
  sources: ['test'],
  models: [model],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('render', () => {
  it('when a score is null, shows n/a', () => {
    const result = formatScore(null)

    expect(result).toBe('n/a')
  })

  it('when a score is a number, rounds to one decimal', () => {
    const result = formatScore(68.81)

    expect(result).toBe('68.8')
  })

  it('when both costs are zero, shows free', () => {
    const result = formatCost(0, 0)

    expect(result).toBe('free')
  })

  it('when costs are set, shows dollars per million', () => {
    const result = formatCost(0.5, 1.5)

    expect(result).toBe('$0.50/1.50')
  })

  it('when a string is shorter than the width, pads on the right', () => {
    const result = padRight('a', 4)

    expect(result).toBe('a   ')
  })

  it('when a string is shorter than the width, pads on the left', () => {
    const result = padLeft('1', 4)

    expect(result).toBe('   1')
  })

  it('when a context length is null, shows n/a', () => {
    const result = formatContext(null)

    expect(result).toBe('n/a')
  })

  it('when a context length is a number, formats with separators', () => {
    const result = formatContext(1000000)

    expect(result).toBe('1,000,000')
  })

  it('when rendering the table, prints rows', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    renderTable([model], cache)

    expect(log).toHaveBeenCalled()
  })

  it('when rendering json, prints the models as JSON', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    renderJson([model])

    expect(log).toHaveBeenCalledWith(JSON.stringify([model], null, 2))
  })
})
