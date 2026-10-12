import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { buildApplicationData } from '../../src/application-data/builder.ts'
import { mockDeno } from '../support/mock-deno-command.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('buildApplicationData', () => {
  it('when a path is provided, prefers it over the command-line path', async () => {
    const path = join(fixturesDirectory, 'config.json')
    const builder = buildApplicationData({
      path,
      deno: mockDeno({
        args: ['--config=./missing-config.json'],
        stdout: '/some/repo\n',
      }),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(true)
    expect(applicationData.config.crowGlobalDirectory).toBe('/custom/crow')
    expect(applicationData.io.repoCrowDirectory).toEqual(fixturesDirectory)
    expect(applicationData.repositoryRoot).toBe('/some/repo')
  })

  it('when no path is provided, uses the command-line path', async () => {
    const path = join(fixturesDirectory, 'config.json')
    const builder = buildApplicationData({
      deno: mockDeno({ args: [`--config=${path}`], stdout: '/some/repo\n' }),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(true)
    expect(applicationData.config.crowGlobalDirectory).toBe('/custom/crow')
    expect(applicationData.io.repoCrowDirectory).toEqual(fixturesDirectory)
    expect(applicationData.repositoryRoot).toBe('/some/repo')
  })

  it('when called with no arguments, uses the real Deno runtime', async () => {
    const builder = buildApplicationData()

    await builder.run()
    const applicationData = builder.result()

    expect(applicationData.repositoryRoot.length).toBeGreaterThan(0)
  })

  it('when no config path resolves, continues with the default config', async () => {
    const builder = buildApplicationData({
      deno: mockDeno({ stdout: '/some/repo\n' }),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(false)
    expect(applicationData.config.crowGlobalDirectory).toBe('~/.crow')
    expect(applicationData.io.repoCrowDirectory).toEqual('.crow')
    expect(applicationData.repositoryRoot).toBe('/some/repo')
  })
})
