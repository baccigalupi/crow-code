import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import {
  DatabaseQuery,
  databaseQuery,
} from '../../src/domain/database-query.ts'

describe('databaseQuery', () => {
  it('when the query succeeds, returns its result', async () => {
    const logger = pino({ enabled: false })

    const query = await databaseQuery(Promise.resolve('result'), logger)

    expect(query.success()).toBe(true)
    expect(query.result()).toBe('result')
  })

  it('when the query fails, logs the error and returns undefined', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')

    const query = await databaseQuery(
      Promise.reject(new Error('query failed')),
      logger,
    )

    expect(query.success()).toBe(false)
    expect(query.result()).toBeUndefined()
    assertSpyCall(loggerErrorSpy, 0, { args: ['query failed'] })
  })

  describe('resultSerializer', () => {
    it('uses the default serializer to pass through the query result', async () => {
      const logger = pino({ enabled: false })

      const query = await databaseQuery(Promise.resolve('result'), logger)

      expect(query.result()).toBe('result')
    })

    it('uses the constructor default serializer when none is provided', async () => {
      const logger = pino({ enabled: false })

      const query = await new DatabaseQuery(Promise.resolve('result'), logger)
        .run()

      expect(query.result()).toBe('result')
    })

    it('uses the constructor custom serializer when one is provided', async () => {
      const logger = pino({ enabled: false })
      const serializer = (result: string | undefined) =>
        result === undefined ? 'missing' : `serialized-${result}`

      const query = await new DatabaseQuery(
        Promise.resolve('result'),
        logger,
        serializer,
      ).run()

      expect(query.result()).toBe('serialized-result')
    })

    it('uses the default serializer to pass through an undefined result', async () => {
      const logger = pino({ enabled: false })

      const query = await databaseQuery(Promise.resolve(undefined), logger)

      expect(query.result()).toBeUndefined()
    })

    it('applies a custom serializer to the query result', async () => {
      const logger = pino({ enabled: false })
      const serializer = (result: string | undefined) =>
        result === undefined ? 'missing' : `serialized-${result}`

      const query = await databaseQuery<string | undefined, string>(
        Promise.resolve('result'),
        logger,
        serializer,
      )

      expect(query.result()).toBe('serialized-result')
    })

    it('applies a custom serializer to an undefined result', async () => {
      const logger = pino({ enabled: false })
      const serializer = (result: string | undefined) =>
        result === undefined ? 'missing' : `serialized-${result}`

      const query = await databaseQuery<string | undefined, string>(
        Promise.resolve(undefined),
        logger,
        serializer,
      )

      expect(query.result()).toBe('missing')
    })
  })
})
