import { isIP } from 'node:net'

export class HostAddresses {
  private hostname: string

  constructor(hostname: string) {
    this.hostname = hostname
  }

  async list() {
    if (isIP(this.host()) !== 0) {
      return [this.host()]
    }

    const entries = await Bun.dns.lookup(this.host())
    return entries.map((entry) => entry.address)
  }

  private host() {
    return this.hostname.replace(/^\[|\]$/g, '')
  }
}
