import { describe, it, expect } from 'vitest'
import { sortRecords } from '../../src/model-discovery/sort'
import { ModelRecord } from '../../src/model-discovery/types'

const baseModel: ModelRecord = {
  id: 'a',
  name: 'a',
  providers: ['nous'],
  reasoning: null,
  coding: null,
  codingSource: null,
  agentic: null,
  costInput: 0,
  costOutput: 0,
  contextLength: null,
  modality: '-',
  reasoningMode: '-',
  knowledgeCutoff: null,
  size: '',
}

describe('sortRecords', () => {
  it('when sorting by coding, orders highest coding first', () => {
    const models = [
      { ...baseModel, id: 'low', coding: 10 },
      { ...baseModel, id: 'high', coding: 90 },
    ]

    const result = sortRecords(models, 'coding')

    expect(result.map((model) => model.id)).toEqual(['high', 'low'])
  })

  it('when a coding value is missing, places it last', () => {
    const models = [
      { ...baseModel, id: 'unscored', coding: null },
      { ...baseModel, id: 'scored', coding: 50 },
    ]

    const result = sortRecords(models, 'coding')

    expect(result.map((model) => model.id)).toEqual(['scored', 'unscored'])
  })

  it('when sorting by cost, orders cheapest first', () => {
    const models = [
      { ...baseModel, id: 'expensive', costInput: 5, costOutput: 5 },
      { ...baseModel, id: 'cheap', costInput: 0.1, costOutput: 0.1 },
    ]

    const result = sortRecords(models, 'cost')

    expect(result.map((model) => model.id)).toEqual(['cheap', 'expensive'])
  })

  it('when sorting, does not mutate the input array', () => {
    const models = [{ ...baseModel, id: 'one', coding: 10 }]

    sortRecords(models, 'coding')

    expect(models).toEqual([{ ...baseModel, id: 'one', coding: 10 }])
  })
})
