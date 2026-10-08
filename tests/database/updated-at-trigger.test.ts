import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { createTestDatabase } from '../support/test-database.ts'
import {
  createUpdatedAtTrigger,
  updatedAtDefault,
} from '../../src/database/updated-at-trigger.ts'

describe('updated-at-trigger', () => {
  it('sets a default value on insert', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database.schema.dropTableIfExists('things')
    await database.schema.createTable('things', (table) => {
      table.increments('id')
      table.text('label')
      table.text('updated_at').notNullable().defaultTo(
        updatedAtDefault(database),
      )
    })
    await createUpdatedAtTrigger(database, 'things')

    await database('things').insert({ label: 'a' })

    const rows = await database('things').select('updated_at')
    expect(rows[0].updated_at).not.toBeNull()
  })

  it('changes updated_at after an update', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database.schema.dropTableIfExists('things')
    await database.schema.createTable('things', (table) => {
      table.increments('id')
      table.text('label')
      table.text('updated_at').notNullable().defaultTo(
        updatedAtDefault(database),
      )
    })
    await createUpdatedAtTrigger(database, 'things')

    await database('things').insert({
      label: 'a',
      updated_at: '2020-01-01T00:00:00.000Z',
    })
    await database('things').where({ label: 'a' }).update({ label: 'b' })

    const rows = await database('things').select('updated_at')
    expect(rows[0].updated_at).not.toBe('2020-01-01T00:00:00.000Z')
  })
})
