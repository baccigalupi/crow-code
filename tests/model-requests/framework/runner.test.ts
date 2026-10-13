import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { Runner } from '../../../src/model-requests/framework/runner.ts'
import { GetGoals } from '../../../src/model-requests/goals.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockFetchSequence } from '../../support/mock-fetch.ts'
import { mockOpenAiClientWithFetch } from '../../support/mock-openai-client.ts'

describe('Runner', () => {
  it('tries models until a request succeeds', async () => {
    const logger = pino({ enabled: false })
    const fetch = mockFetchSequence([
      Response.json({ choices: [{ message: { content: 'invalid' } }] }),
      Response.json({ choices: [{ message: { content: '["done"]' } }] }),
    ])
    const applicationData = mockApplicationData({
      logger,
      chatClient: mockOpenAiClientWithFetch(fetch),
    })
    const database = await applicationData.database()
    await database('providers').insert({
      id: 1,
      name: 'Provider',
      base_url: 'https://example.com/v1',
    })
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'first',
        name: 'First',
        context_length: 1000,
        cost_input: 0,
        cost_output: 0,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
      {
        provider_id: 1,
        identifier: 'second',
        name: 'Second',
        context_length: 1000,
        cost_input: 0,
        cost_output: 0,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
      {
        provider_id: 1,
        identifier: 'third',
        name: 'Third',
        context_length: 1000,
        cost_input: 0,
        cost_output: 0,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])
    const runner = new Runner({
      applicationData,
      operationArguments: {
        modelFilters: { type: 'chat', limit: 3 },
        modelApiRequest: GetGoals,
        requestData: 'build a cli',
      },
    })

    await runner.run()
    await runner.run()

    expect(runner.result()).toEqual(['done'])
    expect(fetch.calls).toHaveLength(2)
  })

  it('when no models are available, returns undefined', async () => {
    const logger = pino({ enabled: false })
    const fetch = mockFetchSequence([])
    const applicationData = mockApplicationData({
      logger,
      chatClient: mockOpenAiClientWithFetch(fetch),
    })
    const runner = new Runner({
      applicationData,
      operationArguments: {
        modelFilters: { type: 'chat' },
        modelApiRequest: GetGoals,
        requestData: 'build a cli',
      },
    })

    await runner.run()

    expect(runner.result()).toBeUndefined()
    expect(runner.reason).toBe('all model requests failed')
    expect(fetch.calls).toHaveLength(0)
  })

  it("logs each failed model's failure reason", async () => {
    const fetch = mockFetchSequence([
      new Response('{"message":"bad request"}', { status: 400 }),
      Response.json({ choices: [{ message: { content: 'invalid' } }] }),
      Response.json({ choices: [{ message: { content: '["done"]' } }] }),
    ])
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientWithFetch(fetch),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const database = await applicationData.database()
    await database('providers').insert({
      id: 1,
      name: 'Provider',
      base_url: 'https://example.com/v1',
    })
    const row = {
      provider_id: 1,
      name: 'Model',
      context_length: 1000,
      cost_input: 0,
      cost_output: 0,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    }
    await database('models').insert([
      { ...row, identifier: 'first' },
      { ...row, identifier: 'second' },
      { ...row, identifier: 'third' },
    ])
    const runner = new Runner({
      applicationData,
      operationArguments: {
        modelFilters: { type: 'chat', limit: 3 },
        modelApiRequest: GetGoals,
        requestData: 'build a cli',
      },
    })

    await runner.run()

    expect(runner.result()).toEqual(['done'])
    assertSpyCall(loggerErrorSpy, 2, {
      args: ['Runner: model `first`: api-error'],
    })
    assertSpyCall(loggerErrorSpy, 4, {
      args: ['Runner: model `second`: invalid-json'],
    })
  })
})
