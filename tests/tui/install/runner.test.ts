import { afterEach, beforeEach, describe, it } from 'node:test'
import { join } from '@std/path'
import { expect } from '@std/expect'
import { installRunner } from '../../../src/tui/install/runner.ts'
import { defaultRuntime } from '../../../src/application-data/runtime.ts'
import {
  crowRepoDirectoryInput,
  installStep,
} from '../../../src/tui/install/interactions/state/config-buffer.ts'
import { emptyBuffer, insertText } from '../../../src/tui/input-buffer.ts'
import { effect } from '@preact/signals-core'
import { mockTerminal } from '../../support/mock-terminal.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('installRunner', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'install-runner')))
  afterEach(async () => {
    await clearDirectory(join(fixturesDirectory, 'install-runner'))
    crowRepoDirectoryInput.value = emptyBuffer()
    installStep.value = 'repo'
  })

  it('when the wizard reaches the write step, writes the config through the runtime and finishes', async () => {
    installRunner(defaultRuntime(), mockTerminal({}).io)
    crowRepoDirectoryInput.value = insertText(
      emptyBuffer(),
      join(fixturesDirectory, 'install-runner', 'crow'),
    )
    const finished = new Promise((resolve) =>
      effect(() => {
        if (installStep.value === 'done') resolve(true)
      })
    )

    installStep.value = 'write'
    await finished

    const written = JSON.parse(
      Deno.readTextFileSync(
        join(fixturesDirectory, 'install-runner', 'crow', 'config.json'),
      ),
    )
    expect(written.crowGlobalDirectory).toBe('~/.crow')
    expect(written.permissions.ignore).toEqual([])
    expect(installStep.peek()).toBe('done')
  })
})
