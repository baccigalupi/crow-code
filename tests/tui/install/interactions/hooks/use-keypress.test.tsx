/** @jsxImportSource @opentui/react */
import { describe, expect, it, mock } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { useKeypress } from '../../../../../src/tui/install/interactions/hooks/use-keypress.ts'
import { buildUserInputStore } from '../../../../support/user-input-store.ts'

describe('useKeypress', () => {
  it('when a char arrives, edits the active directory input', async () => {
    const userInputStore = buildUserInputStore()
    const Reader = () => {
      useKeypress(userInputStore)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.typeText('x')

    expect(userInputStore.repoDirectory.peek().text).toBe('x')
    renderer.destroy()
  })

  it('when text is pasted, inserts it into the active field', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerCredentials'
    const Reader = () => {
      useKeypress(userInputStore)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.pasteBracketedText('sk-123')
    await renderer.idle()

    expect(userInputStore.providerCredentials.peek().text).toBe('sk-123')
    renderer.destroy()
  })

  it('when pasted text has newlines, removes them without advancing', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerCredentials'
    const Reader = () => {
      useKeypress(userInputStore)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.pasteBracketedText('sk-123\r\n')
    await renderer.idle()

    expect(userInputStore.providerCredentials.peek().text).toBe('sk-123')
    expect(userInputStore.step.peek()).toBe('providerCredentials')
    renderer.destroy()
  })

  it('when text is pasted on confirm, leaves the env file alone', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'
    const Reader = () => {
      useKeypress(userInputStore)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.pasteBracketedText('xyz')
    await renderer.idle()

    expect(userInputStore.envFile.peek().text).toBe('')
    renderer.destroy()
  })

  it('when return arrives, advances the step', async () => {
    const userInputStore = buildUserInputStore()
    const Reader = () => {
      useKeypress(userInputStore)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    mockInput.pressEnter()
    await renderer.idle()

    expect(userInputStore.step.peek()).toBe('crowGlobalDirectory')
    renderer.destroy()
  })

  it('when ctrl-c arrives, destroys the renderer', async () => {
    const userInputStore = buildUserInputStore()
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(userInputStore)
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
    const userInputStore = buildUserInputStore()
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(userInputStore)
      return <text>reader</text>
    }
    const { mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
      onDestroy,
      kittyKeyboard: true,
    })

    mockInput.pressEscape()

    expect(onDestroy).not.toHaveBeenCalled()
  })

  it('when n then return arrive on the confirm step, declines and exits without writing', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(userInputStore)
      return <text>reader</text>
    }
    const { mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
      onDestroy,
    })

    await mockInput.typeText('n')
    mockInput.pressEnter()

    expect(userInputStore.confirmation.peek()).toBe(false)
    expect(userInputStore.step.peek()).toBe('confirm')
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })
})
