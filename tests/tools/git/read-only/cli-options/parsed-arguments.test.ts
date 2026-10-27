import { describe, expect, it } from 'bun:test'
import { BooleanFlag } from '../../../../../src/tools/git/read-only/cli-options/boolean-flag.ts'
import { ExactFlag } from '../../../../../src/tools/git/read-only/cli-options/exact-flag.ts'
import { NumberFlag } from '../../../../../src/tools/git/read-only/cli-options/number-flag.ts'
import { GitParsedArguments } from '../../../../../src/tools/git/read-only/cli-options/parsed-arguments.ts'
import { TextFlag } from '../../../../../src/tools/git/read-only/cli-options/text-flag.ts'
import { UnknownFlag } from '../../../../../src/tools/git/read-only/cli-options/unknown-flag.ts'

describe('GitParsedArguments', () => {
  it('when an enabled boolean is given by its exact spelling, builds a boolean flag', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--oneline'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new BooleanFlag({ typed: '--oneline', value: undefined }),
    ])
  })

  it('when a boolean is registered with its value, builds an exact flag for that spelling', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--porcelain=v2': 'boolean' },
      values: ['--porcelain=v2'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new ExactFlag({ typed: '--porcelain=v2', value: 'v2' }),
    ])
  })

  it('when a boolean is registered with its value, builds an unknown flag for a different value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--porcelain=v2': 'boolean' },
      values: ['--porcelain=v1'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new UnknownFlag({ typed: '--porcelain=v1', value: 'v1' }),
    ])
  })

  it('when a token does not start with a dash, builds no flags', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['HEAD'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([])
  })

  it('when a long flag is not enabled, builds an unknown flag', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--graph'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new UnknownFlag({ typed: '--graph', value: undefined }),
    ])
  })

  it('when a long flag abbreviates an enabled flag, builds an unknown flag', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--one'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new UnknownFlag({ typed: '--one', value: undefined }),
    ])
  })

  it('when a long boolean is given a value, builds a boolean flag with that value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--oneline=yes'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new BooleanFlag({ typed: '--oneline=yes', value: 'yes' }),
    ])
  })

  it('when a long valued flag uses --name=value, builds it with the value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--max-count': 'number' },
      values: ['--max-count=5'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new NumberFlag({ typed: '--max-count=5', value: '5' }),
    ])
  })

  it('when a long valued flag has its value as a separate token, builds it with the value and keeps no positional', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--max-count': 'number' },
      values: ['--max-count', '5'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new NumberFlag({ typed: '--max-count', value: '5' }),
    ])
    expect(parsed.positionals).toEqual([])
  })

  it('when a long valued flag has an empty value, builds it with the empty value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--author': 'text' },
      values: ['--author='],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new TextFlag({ typed: '--author=', value: '' }),
    ])
  })

  it('when a short valued flag has a separate value, builds it with the value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-n': 'number' },
      values: ['-n', '5'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([new NumberFlag({ typed: '-n', value: '5' })])
  })

  it('when a short valued flag has an attached value, builds it with the value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-n': 'number' },
      values: ['-n5'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([new NumberFlag({ typed: '-n5', value: '5' })])
  })

  it('when a short text flag has an attached value, builds it with the value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-S': 'text' },
      values: ['-Sfoo'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new TextFlag({ typed: '-Sfoo', value: 'foo' }),
    ])
  })

  it('when a short valued flag has no value, builds it without a value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-n': 'number' },
      values: ['-n'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new NumberFlag({ typed: '-n', value: undefined }),
    ])
  })

  it('when a short number flag is followed by another flag, takes that flag as its value like git does', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-n': 'number', '--oneline': 'boolean' },
      values: ['-n', '--oneline'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new NumberFlag({ typed: '-n', value: '--oneline' }),
    ])
  })

  it('when short flags are clustered, builds the first flag with the rest as its value', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-n': 'number', '-w': 'boolean' },
      values: ['-nw'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([new NumberFlag({ typed: '-nw', value: 'w' })])
  })

  it('when a short boolean has an attached value, builds unknown flags for the cluster', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-w': 'boolean' },
      values: ['-w5'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new UnknownFlag({ typed: '-w5', value: undefined }),
      new UnknownFlag({ typed: '-w5', value: undefined }),
    ])
  })

  it('when a short boolean is followed by a bare word, keeps the word as a positional', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-p': 'boolean' },
      values: ['-p', 'HEAD'],
    })

    const positionals = parsed.positionals

    expect(positionals).toEqual(['HEAD'])
  })

  it('when a short flag is not enabled, builds an unknown flag', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-w': 'boolean' },
      values: ['-o'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new UnknownFlag({ typed: '-o', value: undefined }),
    ])
  })

  it('when a bare -- is given, builds no flags after it', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--oneline', '--', '-weird'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new BooleanFlag({ typed: '--oneline', value: undefined }),
    ])
  })

  it('when tokens follow the first bare --, reports them all as pathspecs', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--oneline', '--', 'src/a.ts', '-x', '--'],
    })

    const pathspecs = parsed.pathspecs

    expect(pathspecs).toEqual(['src/a.ts', '-x', '--'])
  })

  it('when bare tokens precede --, reports them as positionals but not flag values', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-n': 'number', '--oneline': 'boolean' },
      values: ['--oneline', 'HEAD', '-n', '5', 'main', '--', 'x'],
    })

    const positionals = parsed.positionals

    expect(positionals).toEqual(['HEAD', 'main'])
  })

  it('when a long path flag uses --name=value, reports the value as a flag path', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--contents': 'path' },
      values: ['--contents=notes.txt'],
    })

    const flagPaths = parsed.flagPaths

    expect(flagPaths).toEqual(['notes.txt'])
  })

  it('when a short path flag has a separate value, reports it as a flag path only', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-O': 'path' },
      values: ['-O', 'ord'],
    })

    const flagPaths = parsed.flagPaths

    expect(flagPaths).toEqual(['ord'])
    expect(parsed.positionals).toEqual([])
  })

  it('when a short path flag has an attached value, reports it as a flag path', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '-O': 'path' },
      values: ['-Oord'],
    })

    const flagPaths = parsed.flagPaths

    expect(flagPaths).toEqual(['ord'])
  })

  it('when a long path flag has its value as a separate token, reports it as a flag path', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--contents': 'path' },
      values: ['--contents', 'notes.txt'],
    })

    const flagPaths = parsed.flagPaths

    expect(flagPaths).toEqual(['notes.txt'])
  })

  it('when several flags are not enabled, builds an unknown flag for each in order', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--output=f', '--exec=x'],
    })

    const flags = parsed.flags

    expect(flags).toStrictEqual([
      new UnknownFlag({ typed: '--output=f', value: 'f' }),
      new UnknownFlag({ typed: '--exec=x', value: 'x' }),
    ])
  })

  it('when a flag is not enabled, refuses it by name', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--graph'],
    })

    const refusal = parsed.refusal()

    expect(refusal).toBe(
      'flag not allowed: --graph; allowed flags for log: --oneline',
    )
  })

  it('when every flag is enabled, does not refuse', () => {
    const parsed = new GitParsedArguments({
      name: 'log',
      flags: { '--oneline': 'boolean' },
      values: ['--oneline'],
    })

    const refusal = parsed.refusal()

    expect(refusal).toBe('')
  })

  it('when given revisions, a path flag and pathspecs, lists them as paths', () => {
    const parsed = new GitParsedArguments({
      name: 'blame',
      flags: { '--contents': 'path' },
      values: ['HEAD', '--contents=notes.txt', '--', 'src/a.ts'],
    })

    const paths = parsed.paths()

    expect(paths).toEqual(['HEAD', 'notes.txt', 'src/a.ts'])
  })
})
