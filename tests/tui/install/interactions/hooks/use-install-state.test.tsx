/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { useInstallState } from '../../../../../src/tui/install/interactions/hooks/use-install-state.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'
import type { InstallState } from '../../../../../src/tui/install/types.ts'
import { buildInstallStore } from '../../../../support/install-store.ts'

describe('useInstallState', () => {
  it('when rendered, returns the current value of every install signal', async () => {
    const installStore = buildInstallStore()
    installStore.repoDirectory.value = insertText(emptyText(), './lib')
    installStore.step.value = 'envFile'
    installStore.confirmation.value = false
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
    const installStore = buildInstallStore()
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
