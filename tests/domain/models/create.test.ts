import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { CreateModel, createModel } from '../../../src/domain/models/create.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('create', () => {
  it('when params use mixed cases and include extra values, normalizes and filters them', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const applicationData = mockApplicationData({ database, logger })
    const creator = await createModel(applicationData, {
      providerId: 1,
      identifier: 'author/model',
      name: 'Model',
      contextLength: 128000,
      'cost-input': 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
      extra: 'ignored',
    }).run()

    const model = creator.result()
    expect(model.providerId()).toBe(1)
    expect(model.supportedParameters()).toEqual(['temperature'])
    await database.destroy()
  })

  it('when created, stores json columns as text and returns the parsed record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const params = {
      provider_id: 1,
      identifier: 'author/model',
      name: 'Model',
      context_length: 128000,
      cost_input: 1.5,
      cost_output: 3,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: ['temperature'],
      supports_reasoning: true,
      can_disable_reasoning: true,
      reasoning_options: { mandatory: false },
    }

    const applicationData = mockApplicationData({ database, logger })
    const creator = await createModel(applicationData, params).run()
    const row = await database('models').first()

    expect(await creator.success()).toBe(true)
    const model = creator.result()
    expect(model.providerId()).toBe(1)
    expect(model.supportedParameters()).toEqual(['temperature'])
    expect(row.supported_parameters).toBe('["temperature"]')
    expect(row.reasoning_options).toBe('{"mandatory":false}')
    expect(row.supports_reasoning).toBe(1)
    await database.destroy()
  })

  it('when create has not been called, reports failure and an empty model', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const params = {
      provider_id: 1,
      identifier: 'author/model',
      name: 'Model',
      context_length: 128000,
      cost_input: 1.5,
      cost_output: 3,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: ['temperature'],
      supports_reasoning: true,
      can_disable_reasoning: true,
      reasoning_options: { mandatory: false },
    }

    const applicationData = mockApplicationData({ database, logger })
    const creator = new CreateModel({
      applicationData,
      operationArguments: params,
    })

    expect(creator.success()).toBe(false)
    expect(creator.result().supportedParameters()).toEqual([])
    await database.destroy()
  })

  it('when the provider and identifier pair already exists, reports failure', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    const params = {
      provider_id: 1,
      identifier: 'author/model',
      name: 'Model',
      context_length: 128000,
      cost_input: 1.5,
      cost_output: 3,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: ['temperature'],
      supports_reasoning: true,
      can_disable_reasoning: true,
      reasoning_options: { mandatory: false },
    }
    await database('models').insert({
      ...params,
      supported_parameters: '[]',
    })

    const applicationData = mockApplicationData({ database, logger })
    const creator = await createModel(applicationData, params).run()

    expect(await creator.success()).toBe(false)
    expect(creator.result().supportedParameters()).toEqual([])
    assertSpyCall(loggerErrorSpy, 0)
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'UNIQUE constraint failed: models.provider_id, models.identifier',
    )
    await database.destroy()
  })
})
