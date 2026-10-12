import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { buildApplicationData } from '../../src/application-data/builder.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('buildApplicationData', () => {
  it('builds application data from a config file', async () => {
    const builder = buildApplicationData(join(fixturesDirectory, 'config.json'))

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(true)
    expect(applicationData.config.userDirectory).toBe('/custom/crow')
    expect(applicationData.config.ignoredDirectories).toEqual(['vendor'])
    expect(applicationData.config.readableDirectories).toEqual(['/readable'])
    expect(applicationData.config.writableDirectories).toEqual(['/writable'])
  })

  it('fails when application data cannot be built', async () => {
    const builder = buildApplicationData(
      join(fixturesDirectory, 'missing-config.json'),
    )

    await builder.run()

    expect(builder.success()).toBe(false)
    expect(builder.reason).not.toBe('')
  })
})
