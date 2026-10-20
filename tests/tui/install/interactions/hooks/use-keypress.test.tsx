import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { signal } from '@preact/signals-core'
import { useKeypress } from '../../../../../src/tui/install/interactions/hooks/use-keypress.ts'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'
import type { InstallStep } from '../../../../../src/tui/install/types.ts'
import { renderHook } from '../../../../support/render-hook.tsx'

describe('useKeypress', () => {
  it('when a char arrives, edits the active directory input', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('x')

    expect(installData.repoDirectory.peek().text).toBe('x')
    unmount()
  })

  it('when return arrives, advances the step', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('crowGlobalDirectory')
    unmount()
  })

  it('when return arrives on the crowGlobalDirectory step, advances to the envFile step', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      step: signal<InstallStep>('crowGlobalDirectory'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('envFile')
    unmount()
  })

  it('when a char arrives on the envFile step, edits the env input', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('x')

    expect(installData.envFile.peek().text).toBe('x')
    unmount()
  })

  it('when return arrives on the envFile step, advances to confirm', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('confirm')
    unmount()
  })

  it('when confirmed, moves to the write step', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('write')
    unmount()
  })
})
