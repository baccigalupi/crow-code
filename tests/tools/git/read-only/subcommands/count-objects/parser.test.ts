import { describe, expect, it } from 'bun:test'
import { GitCountObjectsParser } from '../../../../../../src/tools/git/read-only/subcommands/count-objects/parser.ts'

describe('GitCountObjectsParser', () => {
  it('when given count-objects output, returns count and size', () => {
    const parser = new GitCountObjectsParser('15 objects, 60 kilobytes\n')

    const result = parser.parse()

    expect(result).toEqual({
      objectCounts: { count: 15, sizeKilobytes: 60 },
    })
  })

  it('when given count-objects -v output, returns every count', () => {
    const parser = new GitCountObjectsParser(
      'count: 15\nsize: 60\nin-pack: 0\npacks: 0\nsize-pack: 0\nprune-packable: 0\ngarbage: 0\nsize-garbage: 0\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      objectCounts: {
        count: 15,
        sizeKilobytes: 60,
        inPack: 0,
        packs: 0,
        sizePackKilobytes: 0,
        prunePackable: 0,
        garbage: 0,
        sizeGarbageKilobytes: 0,
      },
    })
  })
})
