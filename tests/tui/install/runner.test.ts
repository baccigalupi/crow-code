import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInstalltTui } from '../../../src/tui/install/runner.ts'
import { emptyBuffer, insertText } from '../../../src/tui/input-buffer.ts'
import { installStore } from '../../../src/tui/install/interactions/state/config-buffer.ts'
import { effect, signal } from '@preact/signals-core'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockTerminal } from '../../support/mock-terminal.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import type { InstallStep } from '../../../src/tui/install/types.ts'

describe('runInstalltTui', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'install-runner')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'install-runner')))

  it('when the installer reaches the write step, writes the config through the filesystem and finishes', async () => {
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
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step,
      confirmation: signal(true),
    }
    runInstalltTui(mockApplicationData(), mockTerminal({}).io, state)
    const finished = new Promise((resolve) =>
      effect(() => {
        if (step.value === 'done') resolve(true)
      }),
    )

    step.value = 'write'
    await finished

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'install-runner', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.permissions.ignore).toEqual([])
  })

  it('when no store is given, writes the shared install data', async () => {
    installStore.repoDirectory.value = insertText(
      emptyBuffer(),
      join(fixturesDirectory, 'install-runner', 'crow'),
    )
    runInstalltTui(mockApplicationData(), mockTerminal({}).io)
    const finished = new Promise((resolve) =>
      effect(() => {
        if (installStore.step.value === 'done') resolve(true)
      }),
    )

    installStore.step.value = 'write'
    await finished
    installStore.repoDirectory.value = emptyBuffer()
    installStore.step.value = 'repo'

    const written = JSON.parse(
      readFileSync(
        join(fixturesDirectory, 'install-runner', 'crow', 'config.json'),
        'utf8',
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
  })
})
