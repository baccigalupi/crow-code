import { describe, expect, it } from 'bun:test'
import { ContentTypeCheck } from '../../../../src/tools/web/fetch/content-type-check.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ContentTypeCheck', () => {
  it('when the type is image/png, fails naming type and url', async () => {
    const applicationData = mockApplicationData()
    const response = new Response('x', {
      headers: { 'content-type': 'image/png' },
    })
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const check = new ContentTypeCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.success()).toBe(false)
    expect(check.reason).toBe(
      'web fetch content type not allowed: image/png: https://192.0.2.1/a',
    )
  })

  describe('when the type is allowed', () => {
    it('text/html, succeeds', async () => {
      const applicationData = mockApplicationData()
      const response = new Response('x', {
        headers: { 'content-type': 'text/html' },
      })
      const operationArguments = { url: 'https://192.0.2.1/a', response }

      const check = new ContentTypeCheck({
        applicationData,
        operationArguments,
      })
      await check.run()

      expect(check.success()).toBe(true)
      expect(check.reason).toBe('')
    })

    it('text/plain, succeeds', async () => {
      const applicationData = mockApplicationData()
      const response = new Response('x', {
        headers: { 'content-type': 'text/plain' },
      })
      const operationArguments = { url: 'https://192.0.2.1/a', response }

      const check = new ContentTypeCheck({
        applicationData,
        operationArguments,
      })
      await check.run()

      expect(check.success()).toBe(true)
      expect(check.reason).toBe('')
    })

    it('text/markdown, succeeds', async () => {
      const applicationData = mockApplicationData()
      const response = new Response('x', {
        headers: { 'content-type': 'text/markdown' },
      })
      const operationArguments = { url: 'https://192.0.2.1/a', response }

      const check = new ContentTypeCheck({
        applicationData,
        operationArguments,
      })
      await check.run()

      expect(check.success()).toBe(true)
      expect(check.reason).toBe('')
    })

    it('application/json, succeeds', async () => {
      const applicationData = mockApplicationData()
      const response = new Response('x', {
        headers: { 'content-type': 'application/json' },
      })
      const operationArguments = { url: 'https://192.0.2.1/a', response }

      const check = new ContentTypeCheck({
        applicationData,
        operationArguments,
      })
      await check.run()

      expect(check.success()).toBe(true)
      expect(check.reason).toBe('')
    })

    it('application/xml, succeeds', async () => {
      const applicationData = mockApplicationData()
      const response = new Response('x', {
        headers: { 'content-type': 'application/xml' },
      })
      const operationArguments = { url: 'https://192.0.2.1/a', response }

      const check = new ContentTypeCheck({
        applicationData,
        operationArguments,
      })
      await check.run()

      expect(check.success()).toBe(true)
      expect(check.reason).toBe('')
    })

    it('text/xml, succeeds', async () => {
      const applicationData = mockApplicationData()
      const response = new Response('x', {
        headers: { 'content-type': 'text/xml' },
      })
      const operationArguments = { url: 'https://192.0.2.1/a', response }

      const check = new ContentTypeCheck({
        applicationData,
        operationArguments,
      })
      await check.run()

      expect(check.success()).toBe(true)
      expect(check.reason).toBe('')
    })

    it('mixed case with a parameter, succeeds', async () => {
      const applicationData = mockApplicationData()
      const response = new Response('x', {
        headers: { 'content-type': 'Text/HTML; charset=UTF-8' },
      })
      const operationArguments = { url: 'https://192.0.2.1/a', response }

      const check = new ContentTypeCheck({
        applicationData,
        operationArguments,
      })
      await check.run()

      expect(check.success()).toBe(true)
      expect(check.reason).toBe('')
    })
  })

  it('when there is no content type, fails with none', async () => {
    const applicationData = mockApplicationData()
    const response = new Response(null)
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const check = new ContentTypeCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.reason).toBe(
      'web fetch content type not allowed: none: https://192.0.2.1/a',
    )
  })

  it('when the type is rejected, cancels the body without reading', async () => {
    let pulls = 0
    let cancelled = false
    const body = new ReadableStream(
      {
        pull() {
          pulls += 1
        },
        cancel() {
          cancelled = true
        },
      },
      { highWaterMark: 0 },
    )
    const applicationData = mockApplicationData()
    const response = new Response(body, {
      headers: { 'content-type': 'image/png' },
    })
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const check = new ContentTypeCheck({ applicationData, operationArguments })
    await check.run()

    expect(cancelled).toBe(true)
    expect(pulls).toBe(0)
  })
})
