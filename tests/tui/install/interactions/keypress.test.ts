import { describe, expect, it, mock } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { keypress } from '../../../../src/tui/install/interactions/keypress.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('keypress', () => {
  it('when escape arrives, exits', () => {
    const exit = mock(() => {})
    const installData = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { escape: true } }).handle()

    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('when ctrl-c arrives, exits', () => {
    const exit = mock(() => {})
    const installData = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: 'c', key: { ctrl: true } }).handle()

    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('when any key arrives on the done step, exits', () => {
    const exit = mock(() => {})
    const installData = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: 'x', key: {} }).handle()

    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('when return arrives on the repo step, advances to the global directory step', () => {
    const exit = mock(() => {})
    const installData = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { return: true } }).handle()

    expect(installData.step.peek()).toBe('crowGlobalDirectory')
  })

  it('when a letter arrives on the env file step, edits the env file text', () => {
    const exit = mock(() => {})
    const installData = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: 'x', key: {} }).handle()

    expect(installData.envFile.peek()).toEqual({ text: 'x', cursor: 1 })
  })

  describe('on the confirm step', () => {
    it('when left arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(false),
      }

      keypress({
        installData,
        exit,
        input: '',
        key: { leftArrow: true },
      }).handle()

      expect(installData.confirmation.peek()).toBe(true)
    })

    it('when n arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(true),
      }

      keypress({ installData, exit, input: 'n', key: {} }).handle()

      expect(installData.confirmation.peek()).toBe(false)
    })

    it('when down arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(true),
      }

      keypress({
        installData,
        exit,
        input: '',
        key: { downArrow: true },
      }).handle()

      expect(installData.confirmation.peek()).toBe(false)
    })

    it('when j arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(true),
      }

      keypress({ installData, exit, input: 'j', key: {} }).handle()

      expect(installData.confirmation.peek()).toBe(false)
    })

    it('when up arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(false),
      }

      keypress({
        installData,
        exit,
        input: '',
        key: { upArrow: true },
      }).handle()

      expect(installData.confirmation.peek()).toBe(true)
    })

    it('when k arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(false),
      }

      keypress({ installData, exit, input: 'k', key: {} }).handle()

      expect(installData.confirmation.peek()).toBe(true)
    })

    it('when return arrives while confirmed, moves to the write step', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(true),
      }

      keypress({ installData, exit, input: '', key: { return: true } }).handle()

      expect(installData.step.peek()).toBe('write')
    })

    it('when return arrives while declined, exits and stays on confirm', () => {
      const exit = mock(() => {})
      const installData = {
        repoDirectory: signal(emptyText()),
        globalDirectory: signal(emptyText()),
        envFile: signal(emptyText()),
        escalateRead: signal(emptyText()),
        ignore: signal(emptyText()),
        additionalRead: signal(emptyText()),
        additionalWrite: signal(emptyText()),
        escalateWrite: signal(emptyText()),
        allowedLocalScripts: signal(emptyText()),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(false),
      }

      keypress({ installData, exit, input: '', key: { return: true } }).handle()

      expect(exit).toHaveBeenCalledTimes(1)
      expect(installData.step.peek()).toBe('confirm')
    })
  })
})
