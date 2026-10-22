import { describe, expect, it } from 'bun:test'
import { GitFlagValidator } from '../../../../../src/tools/git/read-only/git-passthrough/git-passthrough-flags.ts'

describe('GitFlagValidator', () => {
  it('when an enabled switch is given by its exact spelling, accepts it', () => {
    const validator = new GitFlagValidator({
      flags: { '--oneline': 'switch' },
      values: ['--oneline'],
    })

    validator.validate()

    expect(validator.offenders).toEqual([])
    expect(validator.badNumbers).toEqual([])
  })

  it('when a token does not start with a dash, ignores it', () => {
    const validator = new GitFlagValidator({
      flags: { '--oneline': 'switch' },
      values: ['HEAD'],
    })

    validator.validate()

    expect(validator.offenders).toEqual([])
  })

  it('when a long flag is not enabled, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '--oneline': 'switch' },
      values: ['--graph'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['--graph'])
  })

  it('when a long flag abbreviates an enabled flag, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '--oneline': 'switch' },
      values: ['--one'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['--one'])
  })

  it('when a long switch is given a value, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '--oneline': 'switch' },
      values: ['--oneline=yes'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['--oneline=yes'])
  })

  it('when a long valued flag uses --name=value, accepts it', () => {
    const validator = new GitFlagValidator({
      flags: { '--max-count': 'number' },
      values: ['--max-count=5'],
    })

    validator.validate()

    expect(validator.offenders).toEqual([])
    expect(validator.badNumbers).toEqual([])
  })

  it('when a long valued flag has its value as a separate token, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '--max-count': 'number' },
      values: ['--max-count', '5'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['--max-count'])
  })

  it('when a long number flag has a non-numeric value, reports a bad number', () => {
    const validator = new GitFlagValidator({
      flags: { '--max-count': 'number' },
      values: ['--max-count=x'],
    })

    validator.validate()

    expect(validator.badNumbers).toEqual(['--max-count=x'])
    expect(validator.offenders).toEqual([])
  })

  it('when a long text flag is given a value, accepts it', () => {
    const validator = new GitFlagValidator({
      flags: { '--author': 'text' },
      values: ['--author=ada'],
    })

    validator.validate()

    expect(validator.offenders).toEqual([])
  })

  it('when a short valued flag has a separate value, accepts it', () => {
    const validator = new GitFlagValidator({
      flags: { '-n': 'number' },
      values: ['-n', '5'],
    })

    validator.validate()

    expect(validator.offenders).toEqual([])
    expect(validator.badNumbers).toEqual([])
  })

  it('when a short valued flag has an attached value, accepts it', () => {
    const validator = new GitFlagValidator({
      flags: { '-n': 'number' },
      values: ['-n5'],
    })

    validator.validate()

    expect(validator.offenders).toEqual([])
  })

  it('when a short text flag has an attached value, accepts it', () => {
    const validator = new GitFlagValidator({
      flags: { '-S': 'text' },
      values: ['-Sfoo'],
    })

    validator.validate()

    expect(validator.offenders).toEqual([])
  })

  it('when a short valued flag has no value, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '-n': 'number' },
      values: ['-n'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['-n'])
  })

  it('when a short number flag has a non-numeric separate value, reports a bad number', () => {
    const validator = new GitFlagValidator({
      flags: { '-n': 'number' },
      values: ['-n', 'x'],
    })

    validator.validate()

    expect(validator.badNumbers).toEqual(['-n x'])
    expect(validator.offenders).toEqual([])
  })

  it('when a short number flag has a non-numeric attached value, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '-n': 'number' },
      values: ['-nx'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['-nx'])
  })

  it('when short flags are clustered, reports the cluster', () => {
    const validator = new GitFlagValidator({
      flags: { '-n': 'number', '-w': 'switch' },
      values: ['-nw'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['-nw'])
  })

  it('when a short switch has an attached value, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '-w': 'switch' },
      values: ['-w5'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['-w5'])
  })

  it('when a short flag is not enabled, reports it', () => {
    const validator = new GitFlagValidator({
      flags: { '-w': 'switch' },
      values: ['-o'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['-o'])
  })

  it('when several flags are refused, reports every one in order', () => {
    const validator = new GitFlagValidator({
      flags: { '--oneline': 'switch' },
      values: ['--output=f', '--exec=x'],
    })

    validator.validate()

    expect(validator.offenders).toEqual(['--output=f', '--exec=x'])
  })
})
