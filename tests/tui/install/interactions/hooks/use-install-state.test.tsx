import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { useInstallState } from '../../../../../src/tui/install/interactions/hooks/use-install-state.ts'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'
import type { InstallStep } from '../../../../../src/tui/install/types.ts'
import { inputSignal } from '../../../../support/input-signal.ts'
import { renderHook } from '../../../../support/render-hook.tsx'

describe('useInstallState', () => {
  it('when rendered, returns the current value of every install signal', () => {
    const installStore = {
      repoDirectory: inputSignal('./lib'),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(false),
    }

    const { result, unmount } = renderHook(() => useInstallState(installStore))

    expect(result.current.repoDirectory.text).toBe('./lib')
    expect(result.current.globalDirectory.text).toBe('')
    expect(result.current.step).toBe('envFile')
    expect(result.current.confirmation).toBe(false)
    unmount()
  })

  it('when any signal changes, re-renders with the new values', async () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }
    const { result, unmount } = renderHook(() => useInstallState(installStore))

    installStore.allowedLocalScripts.value = inputSignal('./build.sh').peek()
    installStore.step.value = 'confirm'
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(result.current.allowedLocalScripts.text).toBe('./build.sh')
    expect(result.current.step).toBe('confirm')
    unmount()
  })
})
