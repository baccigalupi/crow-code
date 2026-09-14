import { describe, it, expect } from 'vitest'
import {
  matchAABenchmarks,
  AAModel,
} from '../../../src/model-discovery/ratings/aa-scores'

describe('matchAABenchmarks', () => {
  it('when an AA model matches a catalog id, records its indices', () => {
    const models: AAModel[] = [
      {
        slug: 'deepseek-v4',
        model_creator: { name: 'DeepSeek' },
        evaluations: {
          artificial_analysis_intelligence_index: 40,
          artificial_analysis_coding_index: 60,
          artificial_analysis_agentic_index: 30,
        },
      },
    ]

    const result = matchAABenchmarks(models, new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 40, coding: 60, agentic: 30 },
    })
  })

  it('when several AA models map to the same catalog id, keeps the max of each index', () => {
    const models: AAModel[] = [
      {
        slug: 'deepseek-v4',
        model_creator: { name: 'DeepSeek' },
        evaluations: {
          artificial_analysis_intelligence_index: 40,
          artificial_analysis_coding_index: 60,
          artificial_analysis_agentic_index: 30,
        },
      },
      {
        slug: 'deepseek-v4-high',
        model_creator: { name: 'DeepSeek' },
        evaluations: {
          artificial_analysis_intelligence_index: 50,
          artificial_analysis_coding_index: 55,
          artificial_analysis_agentic_index: 45,
        },
      },
    ]

    const result = matchAABenchmarks(models, new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 50, coding: 60, agentic: 45 },
    })
  })

  it('when no AA model matches the catalog, returns an empty record', () => {
    const models: AAModel[] = [
      {
        slug: 'some-model',
        model_creator: { name: 'Unknown Corp' },
        evaluations: {
          artificial_analysis_intelligence_index: 10,
          artificial_analysis_coding_index: 20,
          artificial_analysis_agentic_index: 30,
        },
      },
    ]

    const result = matchAABenchmarks(models, new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({})
  })

  it('when an index is null, treats it as zero', () => {
    const models: AAModel[] = [
      {
        slug: 'deepseek-v4',
        model_creator: { name: 'DeepSeek' },
        evaluations: {
          artificial_analysis_intelligence_index: null,
          artificial_analysis_coding_index: 55,
          artificial_analysis_agentic_index: null,
        },
      },
    ]

    const result = matchAABenchmarks(models, new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 0, coding: 55, agentic: 0 },
    })
  })
})
