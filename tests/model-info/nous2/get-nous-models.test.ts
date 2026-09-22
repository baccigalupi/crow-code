import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import { loadNousFixture } from '../../support/fixtures.ts'
import { getNousModels } from '../../../src/model-info/nous2/get-nous-models.ts'

const nousConfig = {
  name: 'nous' as const,
  baseUrl: 'https://inference-api.nousresearch.com',
}

describe('getNousModels', () => {
  it('when fetched, returns parsed records matching the fixture', async () => {
    const fixture = await loadNousFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getNousModels(nousConfig, logger, mockFetch)

    expect(result).toHaveLength(fixture.data.length)
    expect(result[0]).toEqual({
      id: 'xiaomi/mimo-v2.6-pro-ultraspeed',
      name: 'Xiaomi: MiMo-V2.6-Pro-UltraSpeed',
      contextLength: 1048576,
      costInput: 4.35,
      costOutput: 8.7,
      modality: 'text+image+audio+video->text',
      supportedParameters: [
        'frequency_penalty',
        'include_reasoning',
        'max_tokens',
        'presence_penalty',
        'reasoning',
        'response_format',
        'stop',
        'structured_outputs',
        'temperature',
        'tool_choice',
        'tools',
        'top_p',
      ],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    })
  })

  it('when fetched, every record has a non-empty id and name', async () => {
    const fixture = await loadNousFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getNousModels(nousConfig, logger, mockFetch)

    expect(result.every((model) => model.id.length > 0)).toBe(true)
    expect(result.every((model) => model.name.length > 0)).toBe(true)
  })

  it('when fetched, every record has a non-empty modality', async () => {
    const fixture = await loadNousFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getNousModels(nousConfig, logger, mockFetch)

    expect(result.every((model) => model.modality.length > 0)).toBe(true)
  })

  it('when fetched, every record has numeric costs and context length', async () => {
    const fixture = await loadNousFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getNousModels(nousConfig, logger, mockFetch)

    expect(result.every((model) => typeof model.costInput === 'number')).toBe(
      true,
    )
    expect(
      result.every((model) => typeof model.costOutput === 'number'),
    ).toBe(true)
    expect(
      result.every((model) => typeof model.contextLength === 'number'),
    ).toBe(true)
  })

  it('when fetched, every record has an array of supported parameters', async () => {
    const fixture = await loadNousFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getNousModels(nousConfig, logger, mockFetch)

    expect(result.every((model) => Array.isArray(model.supportedParameters)))
      .toBe(true)
  })

  it('when the response is not ok, returns an empty list', async () => {
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)

    const result = await getNousModels(nousConfig, logger, mockFetch)

    expect(result).toEqual([])
  })

  it('when the network request fails, returns an empty list', async () => {
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await getNousModels(nousConfig, logger, mockFetch)

    expect(result).toEqual([])
  })
})
