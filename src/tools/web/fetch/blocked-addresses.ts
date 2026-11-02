import { BlockList, isIPv6 } from 'node:net'

export class BlockedAddresses {
  private address: string
  private ranges: ['ipv4' | 'ipv6', string, number][] = [
    ['ipv4', '0.0.0.0', 8],
    ['ipv4', '10.0.0.0', 8],
    ['ipv4', '100.64.0.0', 10],
    ['ipv4', '127.0.0.0', 8],
    ['ipv4', '169.254.0.0', 16],
    ['ipv4', '172.16.0.0', 12],
    ['ipv4', '192.168.0.0', 16],
    ['ipv6', '::1', 128],
    ['ipv6', 'fc00::', 7],
    ['ipv6', 'fe80::', 10],
  ]

  constructor(address: string) {
    this.address = address
  }

  blocked() {
    return this.blockList().check(this.address, this.family())
  }

  private family() {
    if (isIPv6(this.address)) {
      return 'ipv6'
    } else {
      return 'ipv4'
    }
  }

  private blockList() {
    const list = new BlockList()
    this.ranges.forEach(([type, net, prefix]) => {
      list.addSubnet(net, prefix, type)
    })
    return list
  }
}
