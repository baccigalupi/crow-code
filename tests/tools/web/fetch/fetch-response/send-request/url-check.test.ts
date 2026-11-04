import { describe, expect, it, spyOn } from 'bun:test'
import { UrlCheck } from '../../../../../../src/tools/web/fetch/fetch-response/send-request/url-check.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

describe('UrlCheck', () => {
  it('when the url is allowed, succeeds', async () => {
    const applicationData = mockApplicationData()
    const operationArguments = { url: 'https://192.0.2.1/a' }

    const check = new UrlCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.success()).toBe(true)
  })

  it('when the text is not a url, fails', async () => {
    const applicationData = mockApplicationData()
    const operationArguments = { url: 'not a url' }

    const check = new UrlCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.success()).toBe(false)
    expect(check.reason).toBe('invalid url: not a url')
  })

  it('when the scheme is ftp, fails with the shape problem', async () => {
    const applicationData = mockApplicationData()
    const operationArguments = { url: 'ftp://192.0.2.1/a' }

    const check = new UrlCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.reason).toBe('scheme not allowed: ftp:')
  })

  it('when the host is a loopback literal, fails', async () => {
    const applicationData = mockApplicationData()
    const operationArguments = { url: 'http://127.0.0.1/' }

    const check = new UrlCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.reason).toBe(
      'address not allowed: 127.0.0.1 resolves to 127.0.0.1',
    )
  })

  it('when a name resolves to a private address, fails', async () => {
    spyOn(Bun.dns, 'lookup').mockResolvedValue([
      { address: '192.0.2.1', family: 4, ttl: 0 },
      { address: '10.0.0.5', family: 4, ttl: 0 },
    ])
    const applicationData = mockApplicationData()
    const operationArguments = { url: 'https://crow.test/' }

    const check = new UrlCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.reason).toBe(
      'address not allowed: crow.test resolves to 10.0.0.5',
    )
  })

  it('when the lookup rejects, fails with the host and message', async () => {
    spyOn(Bun.dns, 'lookup').mockRejectedValue(new Error('ENOTFOUND'))
    const applicationData = mockApplicationData()
    const operationArguments = { url: 'https://crow.test/' }

    const check = new UrlCheck({ applicationData, operationArguments })
    await check.run()

    expect(check.reason).toBe('host not resolved: crow.test — ENOTFOUND')
  })
})
