import type { GitObjectCounts } from '../../../../../types.ts'

export class GitCountObjectsParser {
  private plainPattern = /^(\d+) objects, (\d+) kilobytes/

  private verboseKeys: Record<string, string> = {
    count: 'count',
    size: 'sizeKilobytes',
    'in-pack': 'inPack',
    packs: 'packs',
    'size-pack': 'sizePackKilobytes',
    'prune-packable': 'prunePackable',
    garbage: 'garbage',
    'size-garbage': 'sizeGarbageKilobytes',
  }

  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    return { objectCounts: this.plainCounts() || this.verboseCounts() }
  }

  private plainCounts(): GitObjectCounts | void {
    if (!this.plainPattern.test(this.output)) return
    const [count, size] = this.output.split(/\D+/)
    return { count: Number(count), sizeKilobytes: Number(size) }
  }

  private verboseCounts() {
    const pairs = this.lines().map((line) => this.verbosePair(line))
    return Object.fromEntries(pairs) as GitObjectCounts
  }

  private lines() {
    return this.output.split('\n').filter((line) => line !== '')
  }

  private verbosePair(line: string) {
    const [key, value] = line.split(': ')
    return [this.verboseKeys[key], Number(value)]
  }
}
