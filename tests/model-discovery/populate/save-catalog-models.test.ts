import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { saveCatalogModels } from '../../../src/model-discovery/populate/save-catalog-models.ts'
import { createTestDatabase } from '../../support/test-database.ts'

describe('saveCatalogModels', () => {
  it('when given models, inserts one row per model with the provider id', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }
    const other = { ...model, id: 'author/other' }

    await saveCatalogModels(database, 7, [model, other], logger)

    const rows = await database('models').orderBy('identifier')
    expect(rows).toHaveLength(2)
    expect(rows[0].provider_id).toBe(7)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[1].provider_id).toBe(7)
    expect(rows[1].identifier).toBe('author/other')
    await database.destroy()
  })

  it('when given a model, maps catalog fields onto the model columns', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }

    await saveCatalogModels(database, 1, [model], logger)

    const row = await database('models').first()
    expect(row.identifier).toBe('author/model')
    expect(row.name).toBe('Model')
    expect(row.context_length).toBe(128000)
    expect(row.cost_input).toBe(1.5)
    expect(row.cost_output).toBe(3)
    expect(row.dynamic_delegation).toBe(0)
    expect(row.modality).toBe('text->text')
    expect(row.supported_parameters).toBe('["temperature"]')
    expect(row.supports_reasoning).toBe(1)
    expect(row.can_disable_reasoning).toBe(1)
    expect(row.reasoning_options).toBe('{"mandatory":false}')
    expect(Object.keys(row)).not.toContain('provider')
    await database.destroy()
  })

  it('when given no models, inserts nothing', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    await saveCatalogModels(database, 1, [], logger)

    expect(await database('models')).toEqual([])
    await database.destroy()
  })

  it('when a model already exists, logs the error and saves the rest', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }
    await saveCatalogModels(database, 1, [model], logger)

    await saveCatalogModels(database, 1, [
      model,
      { ...model, id: 'author/other' },
    ], logger)

    expect(await database('models')).toHaveLength(2)
    assertSpyCall(loggerErrorSpy, 0)
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'UNIQUE constraint failed',
    )
    await database.destroy()
  })
})
