import { describe, expect, it } from 'bun:test'
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
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
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
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
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
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
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
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('x')

    expect(installData.envFile.peek().text).toBe('x')
    unmount()
  })

  it('when return arrives on the envFile step, advances to additionalRead', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('additionalRead')
    unmount()
  })

  it('when return arrives on the additionalRead step, advances to escalateRead', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('additionalRead'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('escalateRead')
    unmount()
  })

  it('when a char arrives on the additionalRead step, edits the additionalRead input', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('additionalRead'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('x')

    expect(installData.additionalRead.peek().text).toBe('x')
    expect(installData.escalateRead.peek().text).toBe('')
    unmount()
  })

  it('when return arrives on the escalateRead step, advances to escalateWrite', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('escalateRead'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('escalateWrite')
    unmount()
  })

  it('when return arrives on the escalateWrite step, advances to allowedLocalScripts', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('escalateWrite'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('allowedLocalScripts')
    unmount()
  })

  it('when return arrives on the allowedLocalScripts step, advances to confirm', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('allowedLocalScripts'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('confirm')
    unmount()
  })

  it('when a char arrives on the allowedLocalScripts step, edits the allowedLocalScripts input', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('allowedLocalScripts'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('x')

    expect(installData.allowedLocalScripts.peek().text).toBe('x')
    expect(installData.escalateWrite.peek().text).toBe('')
    unmount()
  })

  it('when a char arrives on the escalateRead step, edits the escalateRead input', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('escalateRead'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('x')

    expect(installData.escalateRead.peek().text).toBe('x')
    expect(installData.envFile.peek().text).toBe('')
    unmount()
  })

  it('when a char arrives on the escalateWrite step, edits the escalateWrite input', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('escalateWrite'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('x')

    expect(installData.escalateWrite.peek().text).toBe('x')
    expect(installData.envFile.peek().text).toBe('')
    unmount()
  })

  it('when confirmed, moves to the write step', () => {
    const installData = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }
    const { stdin, unmount } = renderHook(() => useKeypress(installData))

    stdin.write('\r')

    expect(installData.step.peek()).toBe('write')
    unmount()
  })
})
