import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { effect, signal } from '@preact/signals-core'
import { writeCrowConfig } from '../../../../src/opentui/install/crow-config/write.ts'
import { defaultFilesystem } from '../../../../src/application-data/filesystem.ts'
import { emptyText, insertText } from '../../../../src/opentui/input-text.ts'
import type { InstallStep } from '../../../../src/opentui/install/types.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('write', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))

  it('when the step becomes write, saves the json to the repo config path and finishes', async () => {
    const installData = {
      repoDirectory: signal(
        insertText(
          emptyText(),
          join(fixturesDirectory, 'write-crow-config', 'crow'),
        ),
      ),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }
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
    const installData = {
      repoDirectory: signal(
        insertText(
          emptyText(),
          join(fixturesDirectory, 'write-crow-config', 'crow'),
        ),
      ),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      additionalRead: signal(insertText(emptyText(), '/docs')),
      escalateRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }
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

  it('when the step is not write, writes nothing', () => {
    const filesystem = defaultFilesystem()
    const mkdir = spyOn(filesystem, 'mkdirWithParents')
    const installData = {
      repoDirectory: signal(
        insertText(
          emptyText(),
          join(fixturesDirectory, 'write-crow-config', 'crow'),
        ),
      ),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }
    const dispose = writeCrowConfig({ installData, filesystem }).subscribe()

    installData.step.value = 'confirm'

    expect(mkdir.mock.calls).toHaveLength(0)
    expect(installData.step.peek()).toBe('confirm')
    dispose()
  })
})
