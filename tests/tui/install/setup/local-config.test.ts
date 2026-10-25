import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LocalConfigTask } from '../../../../src/tui/install/setup/local-config.ts'
import { defaultFilesystem } from '../../../../src/application-data/filesystem.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('LocalConfigTask', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))

  it('when run, saves the json to the repo config path', async () => {
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )

    await new LocalConfigTask({
      installData,
      filesystem: defaultFilesystem(),
    }).run()

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.envFile).toBe('~/.crow/.env')
  })

  it('when additional read directories are typed, writes them to the config', async () => {
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.additionalRead.value = insertText(emptyText(), '/docs')

    await new LocalConfigTask({
      installData,
      filesystem: defaultFilesystem(),
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
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.additionalWrite.value = insertText(emptyText(), '/work')

    await new LocalConfigTask({
      installData,
      filesystem: defaultFilesystem(),
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
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.ignore.value = insertText(emptyText(), '.env')

    await new LocalConfigTask({
      installData,
      filesystem: defaultFilesystem(),
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
