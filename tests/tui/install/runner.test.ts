import { afterEach, beforeEach, describe, it } from 'node:test'
import { join } from '@std/path'
import { expect } from '@std/expect'
import { runInstalltTui } from '../../../src/tui/install/runner.ts'
import { defaultRuntime } from '../../../src/application-data/runtime.ts'
import { emptyBuffer, insertText } from '../../../src/tui/input-buffer.ts'
import { effect, signal } from '@preact/signals-core'
import { mockTerminal } from '../../support/mock-terminal.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import type { InstallStep } from '../../../src/tui/install/types.ts'

describe('runInstalltTui', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'install-runner')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'install-runner')))

  it('when the installer reaches the write step, writes the config through the runtime and finishes', async () => {
    const step = signal<InstallStep>('repo')
    const state = {
      repoDirectory: signal(
        insertText(
          emptyBuffer(),
          join(fixturesDirectory, 'install-runner', 'crow'),
        ),
      ),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      step,
      confirmation: signal(true),
    }
    runInstalltTui(defaultRuntime(), mockTerminal({}).io, state)
    const finished = new Promise((resolve) =>
      effect(() => {
        if (step.value === 'done') resolve(true)
      })
    )

    step.value = 'write'
    await finished

    const written = JSON.parse(
      Deno.readTextFileSync(
        join(fixturesDirectory, 'install-runner', 'crow', 'config.json'),
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.permissions.ignore).toEqual([])
  })
})
