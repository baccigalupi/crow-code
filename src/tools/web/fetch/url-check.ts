import { Operation } from '../../../operation.ts'
import { BlockedAddresses } from './blocked-addresses.ts'
import { HostAddresses } from './host-addresses.ts'
import { UrlShape } from './url-shape.ts'

type TaskArguments = {
  url: string
}

export class UrlCheck extends Operation<TaskArguments> {
  protected override logPrefix = 'Url check: '
  private addresses: string[] = []

  async run() {
    if (URL.canParse(this.operationArguments.url)) {
      await this.check()
    } else {
      this.fail(`invalid url: ${this.operationArguments.url}`)
    }
    return this
  }

  private parsed() {
    return new URL(this.operationArguments.url)
  }

  private async check() {
    const problem = new UrlShape(this.parsed()).problem()
    if (problem === '') {
      await this.checkAddresses()
    } else {
      this.fail(problem)
    }
  }

  private async checkAddresses() {
    try {
      this.addresses = await new HostAddresses(this.parsed().hostname).list()
      this.checkBlocked()
    } catch (error) {
      const { hostname } = this.parsed()
      this.fail(`host not resolved: ${hostname} — ${(error as Error).message}`)
    }
  }

  private checkBlocked() {
    const address = this.blockedAddress()
    if (address !== undefined) {
      const { hostname } = this.parsed()
      this.fail(`address not allowed: ${hostname} resolves to ${address}`)
    }
  }

  private blockedAddress() {
    return this.addresses.find((entry) => new BlockedAddresses(entry).blocked())
  }
}
