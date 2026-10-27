import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { GlobalDirectoryTask } from '../../../../src/tui/install/complete-setup-operations/global-directory.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { Environment } from '../../../../src/application-data/env-vars.ts'
import { defaultFilesystem } from '../../../../src/application-data/filesystem.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('GlobalDirectoryTask', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'global-directory')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'global-directory')))

  it('when run, creates the typed global directory', async () => {
    const path = join(fixturesDirectory, 'global-directory', 'crow-global')
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    store.directories.globalDirectory.insert(path)

    const task = await new GlobalDirectoryTask({
      applicationData,
      operationArguments: { inputs: store.inputs, step: store.step },
    }).run()

    expect(task.success()).toBe(true)
    expect(existsSync(path)).toBe(true)
  })

  it('when the directory already exists, succeeds and keeps it', async () => {
    const path = join(fixturesDirectory, 'global-directory', 'crow-global')
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    store.directories.globalDirectory.insert(path)
    mkdirSync(path, { recursive: true })

    const task = await new GlobalDirectoryTask({
      applicationData,
      operationArguments: { inputs: store.inputs, step: store.step },
    }).run()

    expect(task.success()).toBe(true)
    expect(existsSync(path)).toBe(true)
  })

  it('when the directory starts with ~, creates it under HOME', async () => {
    const home = join(fixturesDirectory, 'global-directory', 'home')
    const envars = new Environment({
      runtimeEnvironment: { HOME: home },
      filesystem: defaultFilesystem(),
    })
    const applicationData = mockApplicationData({ envars })
    const store = new DataStore({ applicationData })

    await new GlobalDirectoryTask({
      applicationData,
      operationArguments: { inputs: store.inputs, step: store.step },
    }).run()

    expect(existsSync(join(home, '.crow'))).toBe(true)
  })

  it('when the directory cannot be created, fails naming the directory', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )

    const task = await new GlobalDirectoryTask({
      applicationData,
      operationArguments: { inputs: store.inputs, step: store.step },
    }).run()

    expect(task.success()).toBe(false)
    expect(task.reason).toBe('could not create ~/.crow: permission denied')
  })

  it('when labelled, names the unexpanded global directory', () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })

    const label = new GlobalDirectoryTask({
      applicationData,
      operationArguments: { inputs: store.inputs, step: store.step },
    }).label()

    expect(label).toBe('Creating ~/.crow')
  })
})
