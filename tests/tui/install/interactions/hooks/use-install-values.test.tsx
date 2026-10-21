import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { signal } from '@preact/signals-core'
import { useInstallValues } from '../../../../../src/tui/install/interactions/hooks/use-install-values.ts'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'
import type { InstallStep } from '../../../../../src/tui/install/types.ts'
import { inputSignal } from '../../../../support/input-signal.ts'
import { renderHook } from '../../../../support/render-hook.tsx'

describe('useInstallValues', () => {
  it('when rendered, returns the current value of every install signal', () => {
    const installState = {
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

    const { result, unmount } = renderHook(() => useInstallValues(installState))

    expect(result.current.repoDirectory.text).toBe('./lib')
    expect(result.current.globalDirectory.text).toBe('')
    expect(result.current.step).toBe('envFile')
    expect(result.current.confirmation).toBe(false)
    unmount()
  })

  it('when any signal changes, re-renders with the new values', async () => {
    const installState = {
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
    const { result, unmount } = renderHook(() => useInstallValues(installState))

    installState.allowedLocalScripts.value = inputSignal('./build.sh').peek()
    installState.step.value = 'confirm'
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(result.current.allowedLocalScripts.text).toBe('./build.sh')
    expect(result.current.step).toBe('confirm')
    unmount()
  })
})
