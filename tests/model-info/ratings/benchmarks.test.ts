import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { fetchAABenchmarks } from '../../../src/model-info/ratings/benchmarks.ts'
import { Environment } from '../../../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import pino from 'pino'
import { createLogger } from '../../../src/logger.ts'

const crowDirectory = join(fixturesDirectory, 'logger', 'aa-key')

describe('fetchAABenchmarks', () => {
  beforeEach(() => clearDirectory(crowDirectory))
  afterEach(() => clearDirectory(crowDirectory))

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
    const logger = pino({ enabled: false })
    const benchmarksFetch = () => {
      return Promise.resolve(
        Response.json({ data: [aaModel], pagination: { has_more: false } }),
      )
    }

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({ AA_API_KEY: 'test-key' }),
      logger,
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
    const logger = pino({ enabled: false })
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
      logger,
      benchmarksFetch,
    )

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 40, coding: 60, agentic: 30 },
    })
  })

  it('when the API responds with an error, returns an empty record', async () => {
    const logger = pino({ enabled: false })
    const benchmarksFetch = () => {
      return Promise.resolve(new Response('server error', { status: 500 }))
    }

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({ AA_API_KEY: 'test-key' }),
      logger,
      benchmarksFetch,
    )

    expect(result).toEqual({})
  })

  it('when the network request fails, returns an empty record', async () => {
    const logger = pino({ enabled: false })
    const benchmarksFetch = () => {
      return Promise.reject(new Error('network down'))
    }

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({ AA_API_KEY: 'test-key' }),
      logger,
      benchmarksFetch,
    )

    expect(result).toEqual({})
  })

  it('when the key is missing, logs the error and returns an empty record', async () => {
    const logPath = join(crowDirectory, 'logs', 'development.log')
    await Deno.mkdir(join(crowDirectory, 'logs'), { recursive: true })
    Deno.writeTextFileSync(logPath, '')
    const fileLogger = createLogger(crowDirectory, 'error')

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({}),
      fileLogger,
    )

    const logContents = Deno.readTextFileSync(logPath)
    expect(result).toEqual({})
    expect(logContents).toContain('AA_API_KEY is not set')
  })
})
