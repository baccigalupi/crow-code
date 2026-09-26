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

    const query = await databaseQuery(Promise.resolve(['result']), logger)

    expect(query.success()).toBe(true)
    expect(query.result()).toEqual(['result'])
  })

  it('when the query fails, logs the error and returns an empty array', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')

    const query = await databaseQuery<string>(
      Promise.reject(new Error('query failed')),
      logger,
    )

    expect(query.success()).toBe(false)
    expect(query.result()).toEqual([])
    assertSpyCall(loggerErrorSpy, 0, { args: ['query failed'] })
  })

  describe('resultSerializer', () => {
    it('uses the constructor default serializer when none is provided', async () => {
      const logger = pino({ enabled: false })

      const query = await new DatabaseQuery(Promise.resolve(['result']), logger)
        .run()

      expect(query.result()).toEqual(['result'])
    })

    it('uses the constructor custom serializer when one is provided', async () => {
      const logger = pino({ enabled: false })
      const serializer = (result: string[]) => result.join(',')

      const query = await new DatabaseQuery(
        Promise.resolve(['first', 'second']),
        logger,
        serializer,
      ).run()

      expect(query.result()).toBe('first,second')
    })

    it('applies a custom serializer to the query result', async () => {
      const logger = pino({ enabled: false })
      const serializer = (result: string[]) => result.join(',')

      const query = await databaseQuery(
        Promise.resolve(['first', 'second']),
        logger,
        serializer,
      )

      expect(query.result()).toBe('first,second')
    })

    it('applies a custom serializer to an empty error result', async () => {
      const logger = pino({ enabled: false })
      const serializer = (result: string[]) => result.join(',')

      const query = await databaseQuery<string, string>(
        Promise.reject(new Error('query failed')),
        logger,
        serializer,
      )

      expect(query.result()).toBe('')
    })
  })
})
