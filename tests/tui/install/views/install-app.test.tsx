/** @jsxImportSource @opentui/react */
import { describe, expect, it, mock } from 'bun:test'
import { signal } from '@preact/signals-core'
import { KeyCodes } from '@opentui/core/testing'
import { testRender } from '@opentui/react/test-utils'
import { installStore as sharedInstallStore } from '../../../../src/tui/install/interactions/state/config-text.ts'
import { InstallApp } from '../../../../src/tui/install/views/install-app.tsx'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { inputSignal } from '../../../support/input-signal.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('InstallApp', () => {
  it('when rendered, shows the header and the repo directory question', async () => {
    const installStore = {
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
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Installing Crow Code')
    expect(captureCharFrame()).toContain('ctrl-c quit')
    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    renderer.destroy()
  })

  it('when the step is past repo, shows the config preview', async () => {
    const installStore = {
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
      step: signal<InstallStep>('crowGlobalDirectory'),
      confirmation: signal(true),
    }
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    expect(captureCharFrame()).toContain('"crowGlobalDirectory": "~/.crow"')
    renderer.destroy()
  })

  it('when text is typed, it becomes the repo directory and shows in the frame', async () => {
    const repoDirectory = inputSignal('')
    const installStore = {
      repoDirectory,
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
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 8,
      })

    await mockInput.typeText('./crow2')
    await renderOnce()

    expect(repoDirectory.peek().text).toBe('./crow2')
    expect(captureCharFrame()).toContain('./crow2')
    renderer.destroy()
  })

  it('when return arrives, advances to the global directory question', async () => {
    const installStore = {
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
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 24,
      })

    mockInput.pressEnter()
    await renderOnce()

    expect(installStore.step.peek()).toBe('crowGlobalDirectory')
    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    renderer.destroy()
  })

  it('when return arrives on the env file step, asks for ignored paths', async () => {
    const installStore = {
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
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 24,
      })

    mockInput.pressEnter()
    await renderOnce()

    expect(installStore.step.peek()).toBe('ignore')
    expect(captureCharFrame()).toContain('Ignored paths: []')
    renderer.destroy()
  })

  it('when text is typed on the ignore step, it shows in the frame', async () => {
    const ignore = inputSignal('')
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore,
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
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 24,
      })

    await mockInput.typeText('.env')
    await renderOnce()

    expect(ignore.peek().text).toBe('.env')
    expect(captureCharFrame()).toContain('Ignored paths: .env')
    renderer.destroy()
  })

  it('when return arrives on the additional read step, asks for additional write directories', async () => {
    const installStore = {
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
      step: signal<InstallStep>('additionalRead'),
      confirmation: signal(true),
    }
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 24,
      })

    mockInput.pressEnter()
    await renderOnce()

    expect(installStore.step.peek()).toBe('additionalWrite')
    expect(captureCharFrame()).toContain('Additional write directories: []')
    renderer.destroy()
  })

  it('when text is typed on the additional write step, it shows in the frame', async () => {
    const additionalWrite = inputSignal('')
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite,
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('additionalWrite'),
      confirmation: signal(true),
    }
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 24,
      })

    await mockInput.typeText('/work')
    await renderOnce()

    expect(additionalWrite.peek().text).toBe('/work')
    expect(captureCharFrame()).toContain('Additional write directories: /work')
    renderer.destroy()
  })

  it('when backspace arrives, the previous char is deleted', async () => {
    const repoDirectory = inputSignal('~/x')
    const installStore = {
      repoDirectory,
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
    const { renderer, mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    mockInput.pressBackspace()

    expect(repoDirectory.peek().text).toBe('~/')
    renderer.destroy()
  })

  it('when home then delete arrive, the first char is removed', async () => {
    const repoDirectory = inputSignal('~/x')
    const installStore = {
      repoDirectory,
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
    const { renderer, mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    mockInput.pressKey(KeyCodes.HOME)
    mockInput.pressKey(KeyCodes.DELETE)

    expect(repoDirectory.peek().text).toBe('/x')
    renderer.destroy()
  })

  it('when left arrows arrive, typing inserts at the cursor', async () => {
    const repoDirectory = inputSignal('~/x')
    const installStore = {
      repoDirectory,
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
    const { renderer, mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    mockInput.pressArrow('left')
    mockInput.pressArrow('left')
    await mockInput.typeText('X')

    expect(repoDirectory.peek().text).toBe('~X/x')
    renderer.destroy()
  })

  it('when home, end and right arrive, the cursor stays at the end', async () => {
    const repoDirectory = inputSignal('~/x')
    const installStore = {
      repoDirectory,
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
    const { renderer, mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    mockInput.pressKey(KeyCodes.HOME)
    mockInput.pressKey(KeyCodes.END)
    mockInput.pressArrow('right')

    expect(repoDirectory.peek().cursor).toBe(3)
    renderer.destroy()
  })

  it('when right arrives on the confirm step, confirmation becomes false', async () => {
    const installStore = {
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
    const { renderer, mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    mockInput.pressArrow('right')

    expect(installStore.confirmation.peek()).toBe(false)
    renderer.destroy()
  })

  it('when left arrives on the confirm step, confirmation becomes true', async () => {
    const installStore = {
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
    const { renderer, mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    mockInput.pressArrow('left')

    expect(installStore.confirmation.peek()).toBe(true)
    renderer.destroy()
  })

  it('when return arrives on the confirm step with yes, moves to the write step', async () => {
    const installStore = {
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
    const { renderer, mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    mockInput.pressEnter()

    expect(installStore.step.peek()).toBe('write')
    renderer.destroy()
  })

  it('when return arrives on the confirm step with no, exits without writing', async () => {
    const installStore = {
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
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8, onDestroy },
    )

    mockInput.pressEnter()

    expect(installStore.step.peek()).toBe('confirm')
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when any key arrives on the done step, exits', async () => {
    const installStore = {
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
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8, onDestroy },
    )

    await mockInput.typeText('x')

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when ctrl-c arrives, exits', async () => {
    const installStore = {
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
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8, onDestroy },
    )

    mockInput.pressCtrlC()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when a provider is added and escape finishes the loop, previews it and asks to confirm', async () => {
    const installStore = {
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
      step: signal<InstallStep>('allowedLocalScripts'),
      confirmation: signal(true),
    }
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 40,
      })

    mockInput.pressEnter()
    await mockInput.typeText('nous')
    mockInput.pressEnter()
    await mockInput.typeText('https://n')
    mockInput.pressEnter()
    await mockInput.typeText('sk-1')
    mockInput.pressEnter()
    mockInput.pressEscape()
    await new Promise((resolve) => setTimeout(resolve, 100))
    await renderOnce()

    const frame = captureCharFrame()
    expect(installStore.step.peek()).toBe('confirm')
    expect(frame).toContain('"providers": [')
    expect(frame).toContain('"name": "nous",')
    expect(frame).toContain('Write config to .crow/config.json?')
    expect(frame).not.toContain('sk-1')
    renderer.destroy()
  })

  it('when escape arrives outside the provider loop, keeps running', async () => {
    const installStore = {
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
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8, onDestroy },
    )

    mockInput.pressEscape()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(onDestroy).not.toHaveBeenCalled()
    expect(installStore.step.peek()).toBe('repo')
  })

  it('when the terminal is taller than the content, the question sits on the last row', async () => {
    const installStore = {
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
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 8 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[7]).toContain('What directory for the local repo crow setup')
    renderer.destroy()
  })

  it('when the panel is tall, the question still sits on the last row', async () => {
    const installStore = {
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
      step: signal<InstallStep>('crowGlobalDirectory'),
      confirmation: signal(true),
    }
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp installStore={installStore} />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[23]).toContain('User crow directory: (~/.crow)')
    renderer.destroy()
  })

  it('when down arrives on the confirm step, the select shows No', async () => {
    const installStore = {
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
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp installStore={installStore} />, {
        width: 70,
        height: 30,
      })

    mockInput.pressArrow('down')
    await renderOnce()

    expect(installStore.confirmation.peek()).toBe(false)
    expect(captureCharFrame()).toContain('▶ No')
    renderer.destroy()
  })

  it('when no store is given, uses the shared install store', async () => {
    sharedInstallStore.step.value = 'repo'
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp />, { width: 70, height: 8 })

    mockInput.pressEnter()
    await renderOnce()

    expect(captureCharFrame()).toContain('Installing Crow Code')
    expect(sharedInstallStore.step.peek()).toBe('crowGlobalDirectory')
    sharedInstallStore.step.value = 'repo'
    renderer.destroy()
  })
})
