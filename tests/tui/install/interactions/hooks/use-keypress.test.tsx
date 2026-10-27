/** @jsxImportSource @opentui/react */
import { describe, expect, it, mock } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { useKeypress } from '../../../../../src/tui/install/interactions/hooks/use-keypress.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('useKeypress', () => {
  it('when a char arrives, edits the active directory input', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const Reader = () => {
      useKeypress(model)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.typeText('x')

    expect(model.directories.repoDirectory.text.peek().text).toBe('x')
    renderer.destroy()
  })

  it('when text is pasted, inserts it into the active field', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerCredentials')
    const Reader = () => {
      useKeypress(model)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.pasteBracketedText('sk-123')
    await renderer.idle()

    expect(model.providers.providerCredentials.text.peek().text).toBe('sk-123')
    renderer.destroy()
  })

  it('when pasted text has newlines, removes them without advancing', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerCredentials')
    const Reader = () => {
      useKeypress(model)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.pasteBracketedText('sk-123\r\n')
    await renderer.idle()

    expect(model.providers.providerCredentials.text.peek().text).toBe('sk-123')
    expect(model.step.current.peek()).toBe('providerCredentials')
    renderer.destroy()
  })

  it('when text is pasted on confirm, leaves the env file alone', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')
    const Reader = () => {
      useKeypress(model)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    await mockInput.pasteBracketedText('xyz')
    await renderer.idle()

    expect(model.directories.envFile.text.peek().text).toBe('')
    renderer.destroy()
  })

  it('when return arrives, advances the step', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const Reader = () => {
      useKeypress(model)
      return <text>reader</text>
    }
    const { renderer, mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
    })

    mockInput.pressEnter()
    await renderer.idle()

    expect(model.step.current.peek()).toBe('crowGlobalDirectory')
    renderer.destroy()
  })

  it('when ctrl-c arrives, destroys the renderer', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(model)
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
    const model = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(model)
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
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')
    const onDestroy = mock(() => {})
    const Reader = () => {
      useKeypress(model)
      return <text>reader</text>
    }
    const { mockInput } = await testRender(<Reader />, {
      width: 20,
      height: 3,
      onDestroy,
    })

    await mockInput.typeText('n')
    mockInput.pressEnter()

    expect(model.confirm.confirmed.peek()).toBe(false)
    expect(model.step.current.peek()).toBe('confirm')
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })
})
