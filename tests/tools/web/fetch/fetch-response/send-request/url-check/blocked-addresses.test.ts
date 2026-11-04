import { describe, expect, it } from 'bun:test'
import { BlockedAddresses } from '../../../../../../../src/tools/web/fetch/fetch-response/send-request/url-check/blocked-addresses.ts'

describe('BlockedAddresses', () => {
  it('when the address is 127.0.0.1, is blocked', () => {
    const addresses = new BlockedAddresses('127.0.0.1')

    const blocked = addresses.blocked()

    expect(blocked).toBe(true)
  })

  it('when the address is 192.0.2.1, is not blocked', () => {
    const addresses = new BlockedAddresses('192.0.2.1')

    const blocked = addresses.blocked()

    expect(blocked).toBe(false)
  })

  describe('IPv4 ranges', () => {
    it('when the address is 0.0.0.1, is blocked', () => {
      const addresses = new BlockedAddresses('0.0.0.1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is 10.1.2.3, is blocked', () => {
      const addresses = new BlockedAddresses('10.1.2.3')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is 100.64.0.1, is blocked', () => {
      const addresses = new BlockedAddresses('100.64.0.1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is 169.254.169.254, is blocked', () => {
      const addresses = new BlockedAddresses('169.254.169.254')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is 172.31.255.255, is blocked', () => {
      const addresses = new BlockedAddresses('172.31.255.255')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is 192.168.1.1, is blocked', () => {
      const addresses = new BlockedAddresses('192.168.1.1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is 172.32.0.0, is not blocked', () => {
      const addresses = new BlockedAddresses('172.32.0.0')

      const blocked = addresses.blocked()

      expect(blocked).toBe(false)
    })
  })

  describe('IPv6 ranges', () => {
    it('when the address is ::1, is blocked', () => {
      const addresses = new BlockedAddresses('::1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is fd00::1, is blocked', () => {
      const addresses = new BlockedAddresses('fd00::1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is fe80::1, is blocked', () => {
      const addresses = new BlockedAddresses('fe80::1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is 2001:db8::1, is not blocked', () => {
      const addresses = new BlockedAddresses('2001:db8::1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(false)
    })
  })

  describe('IPv4-mapped IPv6', () => {
    it('when the address is ::ffff:127.0.0.1, is blocked', () => {
      const addresses = new BlockedAddresses('::ffff:127.0.0.1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is ::ffff:7f00:1, is blocked', () => {
      const addresses = new BlockedAddresses('::ffff:7f00:1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(true)
    })

    it('when the address is ::ffff:192.0.2.1, is not blocked', () => {
      const addresses = new BlockedAddresses('::ffff:192.0.2.1')

      const blocked = addresses.blocked()

      expect(blocked).toBe(false)
    })
  })
})
