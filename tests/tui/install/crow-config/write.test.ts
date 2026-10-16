import { afterEach, beforeEach, describe, it } from 'node:test'
import { join } from '@std/path'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { effect, signal } from '@preact/signals-core'
import { writeCrowConfig } from '../../../../src/tui/install/crow-config/write.ts'
import { defaultRuntime } from '../../../../src/application-data/runtime.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'
import { inputSignal } from '../../../support/input-signal.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('write', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write-crow-config')))

  it('when the step becomes write, saves the json to the repo config path and finishes', async () => {
    const signals = {
      repoDirectory: inputSignal(
        join(fixturesDirectory, 'write-crow-config', 'crow'),
      ),
      globalDirectory: inputSignal(''),
      envFile: inputSignal(''),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }
    const dispose = writeCrowConfig({ signals, runtime: defaultRuntime() })
      .subscribe()
    const finished = new Promise((resolve) =>
      effect(() => {
        if (signals.step.value === 'done') resolve(true)
      })
    )

    signals.step.value = 'write'
    await finished

    const written = JSON.parse(
      Deno.readTextFileSync(
        join(fixturesDirectory, 'write-crow-config', 'crow', 'config.json'),
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.envFile).toBe('~/.crow/.env')
    expect(signals.step.peek()).toBe('done')
    dispose()
  })

  it('when the step is not write, writes nothing', () => {
    const runtime = defaultRuntime()
    using mkdir = spy(runtime, 'mkdir')
    const signals = {
      repoDirectory: inputSignal(
        join(fixturesDirectory, 'write-crow-config', 'crow'),
      ),
      globalDirectory: inputSignal(''),
      envFile: inputSignal(''),
      step: signal<InstallStep>('env'),
      confirmation: signal(true),
    }
    const dispose = writeCrowConfig({ signals, runtime }).subscribe()

    signals.step.value = 'confirm'

    expect(mkdir.calls).toHaveLength(0)
    expect(signals.step.peek()).toBe('confirm')
    dispose()
  })
})
