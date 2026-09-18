import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { fetchAABenchmarks } from '../../../src/model-info/ratings/benchmarks.ts'
import { Environment } from '../../../src/env-vars.ts'
import pino from 'pino'
import { createLogger } from '../../../src/logger.ts'

const logger = pino({ enabled: false })

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
    const crowDirectory = join(
      Deno.cwd(),
      'tests',
      'support',
      'fixtures',
      'logger',
      'aa-key',
    )
    const logPath = join(crowDirectory, 'logs', 'development.log')
    Deno.mkdirSync(join(crowDirectory, 'logs'), { recursive: true })
    Deno.writeTextFileSync(logPath, '')
    const fileLogger = createLogger(crowDirectory, 'error')

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      new Environment({}),
      fileLogger,
    )
    await new Promise<void>((resolve, reject) =>
      fileLogger.flush((error) =>
        error === undefined ? resolve() : reject(error)
      )
    )

    const logContents = Deno.readTextFileSync(logPath)
    expect(result).toEqual({})
    expect(logContents).toContain('AA_API_KEY is not set')
  })
})
