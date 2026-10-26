import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { GlobalDirectoryTask } from '../../../../src/tui/install/complete-setup-operations/global-directory.ts'
import { Environment } from '../../../../src/application-data/env-vars.ts'
import { defaultFilesystem } from '../../../../src/application-data/filesystem.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('GlobalDirectoryTask', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'global-directory')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'global-directory')))

  it('when run, creates the typed global directory', async () => {
    const userInputStore = buildUserInputStore()
    const path = join(fixturesDirectory, 'global-directory', 'crow-global')
    userInputStore.globalDirectory.value = insertText(emptyText(), path)

    const task = await new GlobalDirectoryTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
    }).run()

    expect(task.success()).toBe(true)
    expect(existsSync(path)).toBe(true)
  })

  it('when the directory already exists, succeeds and keeps it', async () => {
    const userInputStore = buildUserInputStore()
    const path = join(fixturesDirectory, 'global-directory', 'crow-global')
    userInputStore.globalDirectory.value = insertText(emptyText(), path)
    mkdirSync(path, { recursive: true })

    const task = await new GlobalDirectoryTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
    }).run()

    expect(task.success()).toBe(true)
    expect(existsSync(path)).toBe(true)
  })

  it('when the directory starts with ~, creates it under HOME', async () => {
    const userInputStore = buildUserInputStore()
    const home = join(fixturesDirectory, 'global-directory', 'home')
    const envars = new Environment({
      runtimeEnvironment: { HOME: home },
      filesystem: defaultFilesystem(),
    })

    await new GlobalDirectoryTask({
      applicationData: mockApplicationData({ envars }),
      operationArguments: { userInputStore },
    }).run()

    expect(existsSync(join(home, '.crow'))).toBe(true)
  })

  it('when the directory cannot be created, fails naming the directory', async () => {
    const userInputStore = buildUserInputStore()
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )

    const task = await new GlobalDirectoryTask({
      applicationData,
      operationArguments: { userInputStore },
    }).run()

    expect(task.success()).toBe(false)
    expect(task.reason).toBe('could not create ~/.crow: permission denied')
  })

  it('when labelled, names the unexpanded global directory', () => {
    const userInputStore = buildUserInputStore()

    const label = new GlobalDirectoryTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
    }).label()

    expect(label).toBe('Creating ~/.crow')
  })
})
