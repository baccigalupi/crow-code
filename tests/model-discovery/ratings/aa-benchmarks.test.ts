import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { stub } from 'jsr:@std/testing/mock'
import { fetchAABenchmarks } from '../../../src/model-discovery/ratings/aa-benchmarks.ts'
import { Environment } from '../../../src/env.ts'

describe('fetchAABenchmarks', () => {
  it('when a catalog id matches an AA model, returns its scores', async () => {
    const aaModel = {
      slug: 'deepseek-v4',
      model_creator: { name: 'DeepSeek' },
      evaluations: {
        artificial_analysis_intelligence_index: 40,
        artificial_analysis_coding_index: 60,
        artificial_analysis_agentic_index: 30,
      },
    }
    const benchmarksFetch = () => {
      return Promise.resolve(
        Response.json({ data: [aaModel], pagination: { has_more: false } }),
      )
    }

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({ AA_API_KEY: 'test-key' }),
      benchmarksFetch,
    )

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 40, coding: 60, agentic: 30 },
    })
  })

  it('when the API returns multiple pages, collects them all', async () => {
    const aaModel = {
      slug: 'deepseek-v4',
      model_creator: { name: 'DeepSeek' },
      evaluations: {
        artificial_analysis_intelligence_index: 40,
        artificial_analysis_coding_index: 60,
        artificial_analysis_agentic_index: 30,
      },
    }
    const benchmarksFetch = (input: string | URL | Request) => {
      const address = String(input)
      if (address.includes('page=2')) {
        return Promise.resolve(
          Response.json({ data: [], pagination: { has_more: false } }),
        )
      }
      return Promise.resolve(
        Response.json({ data: [aaModel], pagination: { has_more: true } }),
      )
    }

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({ AA_API_KEY: 'test-key' }),
      benchmarksFetch,
    )

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 40, coding: 60, agentic: 30 },
    })
  })

  it('when the API responds with an error, returns an empty record', async () => {
    const benchmarksFetch = () => {
      return Promise.resolve(new Response('server error', { status: 500 }))
    }

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({ AA_API_KEY: 'test-key' }),
      benchmarksFetch,
    )

    expect(result).toEqual({})
  })

  it('when the network request fails, returns an empty record', async () => {
    const benchmarksFetch = () => {
      return Promise.reject(new Error('network down'))
    }

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({ AA_API_KEY: 'test-key' }),
      benchmarksFetch,
    )

    expect(result).toEqual({})
  })

  it('when the key is missing, returns an empty record', async () => {
    using errorStub = stub(console, 'error', () => {})

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({}),
    )

    expect(result).toEqual({})
    expect(errorStub.calls.length).toBe(1)
  })
})
