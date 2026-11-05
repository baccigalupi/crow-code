import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LocalConfigTask } from '../../../../../src/tui/install/interactions/run-all/local-config-task.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import {
  clearDirectory,
  fixturesDirectory,
} from '../../../../support/fixtures.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('LocalConfigTask', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))

  it('when labelled, names the config path being written', () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })

    const label = new LocalConfigTask({
      applicationData,
      operationArguments: { inputs: store.inputs.peek() },
    }).label()

    expect(label).toBe('Writing config to .crow/config.json')
  })

  it('when run, saves the json to the repo config path', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    store.directories.repoDirectory.insert(
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )

    const task = await new LocalConfigTask({
      applicationData,
      operationArguments: { inputs: store.inputs.peek() },
    }).run()

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(task.success()).toBe(true)
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.envFile).toBe('~/.crow/.env')
  })

  it('when the config cannot be written, fails naming the config path', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )

    const task = await new LocalConfigTask({
      applicationData,
      operationArguments: { inputs: store.inputs.peek() },
    }).run()

    expect(task.success()).toBe(false)
    expect(task.reason).toBe(
      'could not write .crow/config.json: permission denied',
    )
  })

  it('when additional read directories are typed, writes them to the config', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    store.directories.repoDirectory.insert(
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    store.permissions.additionalRead.insert('/docs')

    await new LocalConfigTask({
      applicationData,
      operationArguments: { inputs: store.inputs.peek() },
    }).run()

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.permissions.additionalRead).toEqual(['/docs'])
  })

  it('when additional write directories are typed, writes them to the config', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    store.directories.repoDirectory.insert(
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    store.permissions.additionalWrite.insert('/work')

    await new LocalConfigTask({
      applicationData,
      operationArguments: { inputs: store.inputs.peek() },
    }).run()

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.permissions.additionalWrite).toEqual(['/work'])
  })

  it('when ignore paths are typed, writes them to the config', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    store.directories.repoDirectory.insert(
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    store.permissions.ignore.insert('.env')

    await new LocalConfigTask({
      applicationData,
      operationArguments: { inputs: store.inputs.peek() },
    }).run()

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.permissions.ignore).toEqual(['.env'])
  })
})
