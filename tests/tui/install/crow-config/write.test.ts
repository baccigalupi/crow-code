import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { effect } from '@preact/signals-core'
import { writeCrowConfig } from '../../../../src/tui/install/crow-config/write.ts'
import { defaultFilesystem } from '../../../../src/application-data/filesystem.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('write', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))

  it('when the step becomes write, saves the json to the repo config path and finishes', async () => {
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.step.value = 'confirm'
    const dispose = writeCrowConfig({
      installData,
      filesystem: defaultFilesystem(),
    }).subscribe()
    const finished = new Promise((resolve) =>
      effect(() => {
        if (installData.step.value === 'done') resolve(true)
      }),
    )

    installData.step.value = 'write'
    await finished

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.envFile).toBe('~/.crow/.env')
    expect(installData.step.peek()).toBe('done')
    dispose()
  })

  it('when additional read directories are typed, writes them to the config', async () => {
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.additionalRead.value = insertText(emptyText(), '/docs')
    installData.step.value = 'confirm'
    const dispose = writeCrowConfig({
      installData,
      filesystem: defaultFilesystem(),
    }).subscribe()
    const finished = new Promise((resolve) =>
      effect(() => {
        if (installData.step.value === 'done') resolve(true)
      }),
    )

    installData.step.value = 'write'
    await finished

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.permissions.additionalRead).toEqual(['/docs'])
    dispose()
  })

  it('when additional write directories are typed, writes them to the config', async () => {
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.additionalWrite.value = insertText(emptyText(), '/work')
    installData.step.value = 'confirm'
    const dispose = writeCrowConfig({
      installData,
      filesystem: defaultFilesystem(),
    }).subscribe()
    const finished = new Promise((resolve) =>
      effect(() => {
        if (installData.step.value === 'done') resolve(true)
      }),
    )

    installData.step.value = 'write'
    await finished

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.permissions.additionalWrite).toEqual(['/work'])
    dispose()
  })

  it('when ignore paths are typed, writes them to the config', async () => {
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.ignore.value = insertText(emptyText(), '.env')
    installData.step.value = 'confirm'
    const dispose = writeCrowConfig({
      installData,
      filesystem: defaultFilesystem(),
    }).subscribe()
    const finished = new Promise((resolve) =>
      effect(() => {
        if (installData.step.value === 'done') resolve(true)
      }),
    )

    installData.step.value = 'write'
    await finished

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.permissions.ignore).toEqual(['.env'])
    dispose()
  })

  it('when the step is not write, writes nothing', () => {
    const filesystem = defaultFilesystem()
    const mkdir = spyOn(filesystem, 'mkdirWithParents')
    const installData = buildInstallStore()
    installData.repoDirectory.value = insertText(
      emptyText(),
      join(fixturesDirectory, 'write-crow-config', 'crow'),
    )
    installData.step.value = 'envFile'
    const dispose = writeCrowConfig({ installData, filesystem }).subscribe()

    installData.step.value = 'confirm'

    expect(mkdir.mock.calls).toHaveLength(0)
    expect(installData.step.peek()).toBe('confirm')
    dispose()
  })
})
