/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { testRender } from '@opentui/react/test-utils'
import { useInstallState } from '../../../../../src/tui/install/interactions/hooks/use-install-state.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'
import type {
  InstallState,
  InstallStep,
} from '../../../../../src/tui/install/types.ts'

describe('useInstallState', () => {
  it('when rendered, returns the current value of every install signal', async () => {
    const installStore = {
      repoDirectory: signal(insertText(emptyText(), './lib')),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(false),
    }
    const result: { current: InstallState | null } = { current: null }
    const Reader = () => {
      result.current = useInstallState(installStore)
      return <text>reader</text>
    }

    const { renderer } = await testRender(<Reader />, { width: 10, height: 1 })

    expect(result.current).toMatchObject({
      repoDirectory: { text: './lib' },
      globalDirectory: { text: '' },
      step: 'envFile',
      confirmation: false,
    })
    renderer.destroy()
  })

  it('when any signal changes, re-renders with the new values', async () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }
    const result: { current: InstallState | null } = { current: null }
    const Reader = () => {
      result.current = useInstallState(installStore)
      return <text>reader</text>
    }
    const { renderer, renderOnce } = await testRender(<Reader />, {
      width: 10,
      height: 1,
    })

    installStore.allowedLocalScripts.value = insertText(
      emptyText(),
      './build.sh',
    )
    installStore.step.value = 'confirm'
    await renderOnce()

    expect(result.current).toMatchObject({
      allowedLocalScripts: { text: './build.sh' },
      step: 'confirm',
    })
    renderer.destroy()
  })
})
