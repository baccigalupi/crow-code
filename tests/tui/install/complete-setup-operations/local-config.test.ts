import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LocalConfigTask } from '../../../../src/tui/install/complete-setup-operations/local-config.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('LocalConfigTask', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))

  it('when labelled, names the config path being written', () => {
    const userInputStore = buildUserInputStore()

    const label = new LocalConfigTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
    }).label()

    expect(label).toBe('Writing config to .crow/config.json')
  })

  it('when run, saves the json to the repo config path', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )

    const task = await new LocalConfigTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
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
    const userInputStore = buildUserInputStore()
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )

    const task = await new LocalConfigTask({
      applicationData,
      operationArguments: { userInputStore },
    }).run()

    expect(task.success()).toBe(false)
    expect(task.reason).toBe(
      'could not write .crow/config.json: permission denied',
    )
  })

  it('when additional read directories are typed, writes them to the config', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    userInputStore.additionalRead.value = insertText(emptyText(), '/docs')

    await new LocalConfigTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
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
    const userInputStore = buildUserInputStore()
    userInputStore.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    userInputStore.additionalWrite.value = insertText(emptyText(), '/work')

    await new LocalConfigTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
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
    const userInputStore = buildUserInputStore()
    userInputStore.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    userInputStore.ignore.value = insertText(emptyText(), '.env')

    await new LocalConfigTask({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
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
