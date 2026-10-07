import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import {
  DatabaseQuery,
  databaseQuery,
} from '../../src/domain/database-query.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'

describe('databaseQuery', () => {
  it('when the query succeeds, returns its result', async () => {
    const applicationData = mockApplicationData()

    const query = await databaseQuery({
      applicationData,
      operationArguments: { query: Promise.resolve(['result']) },
    }).run()

    expect(query.success()).toBe(true)
    expect(query.result()).toEqual(['result'])
  })

  it('when the query fails, logs the error and returns an empty array', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')

    const query = await databaseQuery<string>({
      applicationData: mockApplicationData({ logger }),
      operationArguments: { query: Promise.reject(new Error('query failed')) },
    }).run()

    expect(query.success()).toBe(false)
    expect(query.result()).toEqual([])
    assertSpyCall(loggerErrorSpy, 0, {
      args: ['Database query: query failed'],
    })
  })

  describe('resultSerializer', () => {
    it('uses the constructor default serializer when none is provided', async () => {
      const applicationData = mockApplicationData()

      const query = await new DatabaseQuery({
        applicationData,
        operationArguments: { query: Promise.resolve(['result']) },
      }).run()

      expect(query.result()).toEqual(['result'])
    })

    it('uses the constructor custom serializer when one is provided', async () => {
      const serializer = (result: string[]) => result.join(',')

      const query = await new DatabaseQuery({
        applicationData: mockApplicationData(),
        operationArguments: {
          query: Promise.resolve(['first', 'second']),
          resultSerializer: serializer,
        },
      }).run()

      expect(query.result()).toBe('first,second')
    })

    it('applies a custom serializer to the query result', async () => {
      const serializer = (result: string[]) => result.join(',')

      const query = await databaseQuery({
        applicationData: mockApplicationData(),
        operationArguments: {
          query: Promise.resolve(['first', 'second']),
          resultSerializer: serializer,
        },
      }).run()

      expect(query.result()).toBe('first,second')
    })

    it('applies a custom serializer to an empty error result', async () => {
      const serializer = (result: string[]) => result.join(',')

      const query = await databaseQuery<string, string>({
        applicationData: mockApplicationData(),
        operationArguments: {
          query: Promise.reject(new Error('query failed')),
          resultSerializer: serializer,
        },
      }).run()

      expect(query.result()).toBe('')
    })
  })
})
