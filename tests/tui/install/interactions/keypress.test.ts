import { describe, expect, it, mock } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { keypress } from '../../../../src/tui/install/interactions/keypress.ts'
import type {
  InstallProvider,
  InstallStep,
} from '../../../../src/tui/install/types.ts'

describe('keypress', () => {
  it('when escape arrives on a step without cancel, stays put', () => {
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('ignore'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { escape: true } }).handle()

    expect(exit).not.toHaveBeenCalled()
    expect(installData.step.peek()).toBe('ignore')
  })

  it('when a raw escape character arrives, stays put without editing', () => {
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('ignore'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '\x1b', key: {} }).handle()

    expect(exit).not.toHaveBeenCalled()
    expect(installData.ignore.peek()).toEqual({ text: '', cursor: 0 })
  })

  it('when escape arrives on a provider step, drops the draft and moves to confirm', () => {
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
      providerName: signal({ text: 'or', cursor: 2 }),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([{ name: 'nous', url: 'https://n' }]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerUrl'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { escape: true } }).handle()

    expect(installData.step.peek()).toBe('confirm')
    expect(installData.providerName.peek()).toEqual({ text: '', cursor: 0 })
    expect(installData.providers.peek()).toEqual([
      { name: 'nous', url: 'https://n' },
    ])
  })

  it('when tab arrives on a provider step, moves to the next field', () => {
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
      providerName: signal({ text: 'nous', cursor: 4 }),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal<readonly InstallProvider[]>([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerName'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { tab: true } }).handle()

    expect(installData.step.peek()).toBe('providerUrl')
    expect(installData.providerName.peek()).toEqual({ text: 'nous', cursor: 4 })
  })

  it('when shift+tab arrives on the first provider field, stays put', () => {
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal<readonly InstallProvider[]>([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerName'),
      confirmation: signal(true),
    }

    keypress({
      installData,
      exit,
      input: '',
      key: { tab: true, shift: true },
    }).handle()

    expect(installData.step.peek()).toBe('providerName')
  })

  it('when tab arrives on the last provider field, stays put', () => {
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal<readonly InstallProvider[]>([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerCredentials'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { tab: true } }).handle()

    expect(installData.step.peek()).toBe('providerCredentials')
  })

  it('when tab arrives on a step without fields, stays put', () => {
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal<readonly InstallProvider[]>([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('ignore'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { tab: true } }).handle()

    expect(installData.step.peek()).toBe('ignore')
  })

  it('when return arrives on the credentials step, commits the provider and starts another', () => {
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
      providerName: signal({ text: 'nous', cursor: 4 }),
      providerUrl: signal({ text: 'https://n', cursor: 9 }),
      providerCredentials: signal({ text: 'sk-1', cursor: 4 }),
      providers: signal<readonly InstallProvider[]>([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerCredentials'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { return: true } }).handle()

    expect(installData.providers.peek()).toEqual([
      { name: 'nous', url: 'https://n' },
    ])
    expect(installData.envBuffer.peek()).toEqual({ NOUS_API_KEY: 'sk-1' })
    expect(installData.providerName.peek()).toEqual({ text: '', cursor: 0 })
    expect(installData.providerUrl.peek()).toEqual({ text: '', cursor: 0 })
    expect(installData.providerCredentials.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(installData.step.peek()).toBe('providerName')
  })

  it('when return arrives on the credentials step with no credential, buffers nothing', () => {
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
      providerName: signal({ text: 'ollama', cursor: 6 }),
      providerUrl: signal({ text: 'http://o', cursor: 8 }),
      providerCredentials: signal(emptyText()),
      providers: signal<readonly InstallProvider[]>([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerCredentials'),
      confirmation: signal(true),
    }

    keypress({ installData, exit, input: '', key: { return: true } }).handle()

    expect(installData.providers.peek()).toEqual([
      { name: 'ollama', url: 'http://o' },
    ])
    expect(installData.envBuffer.peek()).toEqual({})
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
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
        providerName: signal(emptyText()),
        providerUrl: signal(emptyText()),
        providerCredentials: signal(emptyText()),
        providers: signal([]),
        envBuffer: signal({}),
        step: signal<InstallStep>('confirm'),
        confirmation: signal(false),
      }

      keypress({ installData, exit, input: '', key: { return: true } }).handle()

      expect(exit).toHaveBeenCalledTimes(1)
      expect(installData.step.peek()).toBe('confirm')
    })
  })
})
