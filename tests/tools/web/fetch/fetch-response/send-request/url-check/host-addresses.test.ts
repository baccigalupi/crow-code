import { describe, expect, it, spyOn } from 'bun:test'
import { HostAddresses } from '../../../../../../../src/tools/web/fetch/fetch-response/send-request/url-check/host-addresses.ts'

describe('HostAddresses', () => {
  it('when the host is an IPv4 literal, returns it without lookup', async () => {
    const lookup = spyOn(Bun.dns, 'lookup')

    const addresses = await new HostAddresses('192.0.2.1').list()

    expect(addresses).toEqual(['192.0.2.1'])
    expect(lookup).not.toHaveBeenCalled()
  })

  it('when the host is a bracketed IPv6 literal, returns it bare', async () => {
    const hostAddresses = new HostAddresses('[::1]')

    const addresses = await hostAddresses.list()

    expect(addresses).toEqual(['::1'])
  })

  it('when the host is a name, returns every looked-up address', async () => {
    spyOn(Bun.dns, 'lookup').mockResolvedValue([
      { address: '192.0.2.1', family: 4, ttl: 0 },
      { address: '::1', family: 6, ttl: 0 },
    ])

    const addresses = await new HostAddresses('crow.test').list()

    expect(addresses).toEqual(['192.0.2.1', '::1'])
  })
})
