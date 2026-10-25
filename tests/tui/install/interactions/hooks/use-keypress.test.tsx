/** @jsxImportSource @opentui/react */
import { describe, expect, it, mock } from 'bun:test'
import { signal } from '@preact/signals-core'
import { testRender } from '@opentui/react/test-utils'
import { useKeypress } from '../../../../../src/tui/install/interactions/hooks/use-keypress.ts'
import { emptyText } from '../../../../../src/tui/input-text.ts'
import type { InstallStep } from '../../../../../src/tui/install/types.ts'

describe('useKeypress', () => {
  it('when a char arrives, edits the active directory input', async () => {
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
    const Reader = () => {
      useKeypress(installData)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.typeText('x')

    expect(installData.repoDirectory.peek().text).toBe('x')
    renderer.destroy()
  })

  it('when return arrives, advances the step', async () => {
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
    const Reader = () => {
      useKeypress(installData)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    mockInput.pressEnter()
    await renderer.idle()

    expect(installData.step.peek()).toBe('crowGlobalDirectory')
    renderer.destroy()
  })

  it('when ctrl-c arrives, destroys the renderer', async () => {
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
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(installData)
      return <text>reader</text>
    }
    const { mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
      onDestroy,
    })

    mockInput.pressCtrlC()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when escape arrives, keeps the renderer', async () => {
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
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(installData)
      return <text>reader</text>
    }
    const { mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
      onDestroy,
    })

    mockInput.pressEscape()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(onDestroy).not.toHaveBeenCalled()
  })

  it('when n then return arrive on the confirm step, declines and exits without writing', async () => {
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
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(installData)
      return <text>reader</text>
    }
    const { mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
      onDestroy,
    })

    await mockInput.typeText('n')
    mockInput.pressEnter()

    expect(installData.confirmation.peek()).toBe(false)
    expect(installData.step.peek()).toBe('confirm')
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })
})
