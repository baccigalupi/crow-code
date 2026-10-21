import { afterEach, beforeEach, describe, it } from 'node:test'
import { join } from '@std/path'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { effect, signal } from '@preact/signals-core'
import { writeCrowConfig } from '../../../../src/tui/install/crow-config/write.ts'
import { defaultFilesystem } from '../../../../src/application-data/filesystem.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'
import { inputSignal } from '../../../support/input-signal.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('write', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))

  it('when the step becomes write, saves the json to the repo config path and finishes', async () => {
    const installData = {
      repoDirectory: inputSignal(
        join(fixturesDirectory, 'write-crow-config', 'crow'),
      ),
      globalDirectory: inputSignal(''),
      envFile: inputSignal(''),
      escalateRead: inputSignal(''),
      additionalRead: inputSignal(''),
      escalateWrite: inputSignal(''),
      allowedLocalScripts: inputSignal(''),
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
      })
    )

    installData.step.value = 'write'
    await finished

    const written = JSON.parse(
      Deno.readTextFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.envFile).toBe('~/.crow/.env')
    expect(installData.step.peek()).toBe('done')
    dispose()
  })

  it('when additional read directories are typed, writes them to the config', async () => {
    const installData = {
      repoDirectory: inputSignal(
        join(fixturesDirectory, 'write-crow-config', 'crow'),
      ),
      globalDirectory: inputSignal(''),
      envFile: inputSignal(''),
      additionalRead: inputSignal('/docs'),
      escalateRead: inputSignal(''),
      escalateWrite: inputSignal(''),
      allowedLocalScripts: inputSignal(''),
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
      })
    )

    installData.step.value = 'write'
    await finished

    const written = JSON.parse(
      Deno.readTextFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
      ),
    )
    expect(written.permissions.additionalRead).toEqual(['/docs'])
    dispose()
  })

  it('when the step is not write, writes nothing', () => {
    const filesystem = defaultFilesystem()
    using mkdir = spy(filesystem, 'mkdirWithParents')
    const installData = {
      repoDirectory: inputSignal(
        join(fixturesDirectory, 'write-crow-config', 'crow'),
      ),
      globalDirectory: inputSignal(''),
      envFile: inputSignal(''),
      escalateRead: inputSignal(''),
      additionalRead: inputSignal(''),
      escalateWrite: inputSignal(''),
      allowedLocalScripts: inputSignal(''),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }
    const dispose = writeCrowConfig({ installData, filesystem }).subscribe()

    installData.step.value = 'confirm'

    expect(mkdir.calls).toHaveLength(0)
    expect(installData.step.peek()).toBe('confirm')
    dispose()
  })
})
