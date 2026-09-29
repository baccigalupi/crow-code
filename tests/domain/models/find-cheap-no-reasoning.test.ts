import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { ModelEntity } from '../../../src/domain/models/model.ts'
import { modelFindCheapNoReasoning } from '../../../src/domain/models/find-cheap-no-reasoning.ts'
import {
  cleanDatabase,
  createTestDatabase,
} from '../../support/test-database.ts'
import { seedCheapModelCandidates } from '../../support/model-rows.ts'

describe('modelFindCheapNoReasoning', () => {
  it('returns no-reasoning-possible models in insertion order', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await seedCheapModelCandidates(database)

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models.map((model) => model.identifier())).toEqual([
      'disableable',
      'free',
      'cheap',
      'off_by_default',
    ])
    for (const model of models) expect(model).toBeInstanceOf(ModelEntity)
    await database.destroy()
  })

  it('excludes embedding models that do not support reasoning', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await seedCheapModelCandidates(database)

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models.map((model) => model.identifier())).not.toContain('embedding')
    await database.destroy()
  })

  it('when given a count, limits the results', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await seedCheapModelCandidates(database)

    const models = await modelFindCheapNoReasoning(database, logger).first(1)

    expect(models.map((model) => model.identifier())).toEqual(['disableable'])
    await database.destroy()
  })

  it('when the table is empty, returns an empty array', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models).toEqual([])
    await database.destroy()
  })

  it('when the query fails, logs the error and returns an empty array', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    await cleanDatabase(database)

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models).toEqual([])
    assertSpyCall(loggerErrorSpy, 0)
    await database.destroy()
  })
})
