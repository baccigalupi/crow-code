/** @jsxImportSource @opentui/react */
import { describe, expect, it, mock } from 'bun:test'
import { KeyCodes } from '@opentui/core/testing'
import { testRender } from '@opentui/react/test-utils'
import { InstallApp } from '../../../../src/tui/install/views/install-app.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('InstallApp', () => {
  it('when rendered, shows the header and the repo directory question', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp model={model} />,
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
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('crowGlobalDirectory')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp model={model} />,
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
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 8 })

    await mockInput.typeText('./crow2')
    await renderOnce()

    expect(model.directories.repoDirectory.text.peek().text).toBe('./crow2')
    expect(captureCharFrame()).toContain('./crow2')
    renderer.destroy()
  })

  it('when return arrives, advances to the global directory question', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 24 })

    mockInput.pressEnter()
    await renderOnce()

    expect(model.step.current.peek()).toBe('crowGlobalDirectory')
    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    renderer.destroy()
  })

  it('when return arrives on the env file step, asks for ignored paths', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('envFile')
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 24 })

    mockInput.pressEnter()
    await renderOnce()

    expect(model.step.current.peek()).toBe('ignore')
    expect(captureCharFrame()).toContain('Ignored paths: []')
    renderer.destroy()
  })

  it('when text is typed on the ignore step, it shows in the frame', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('ignore')
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 24 })

    await mockInput.typeText('.env')
    await renderOnce()

    expect(model.permissions.ignore.text.peek().text).toBe('.env')
    expect(captureCharFrame()).toContain('Ignored paths: .env')
    renderer.destroy()
  })

  it('when return arrives on the additional read step, asks for additional write directories', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('additionalRead')
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 24 })

    mockInput.pressEnter()
    await renderOnce()

    expect(model.step.current.peek()).toBe('additionalWrite')
    expect(captureCharFrame()).toContain('Additional write directories: []')
    renderer.destroy()
  })

  it('when text is typed on the additional write step, it shows in the frame', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('additionalWrite')
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 24 })

    await mockInput.typeText('/work')
    await renderOnce()

    expect(model.permissions.additionalWrite.text.peek().text).toBe('/work')
    expect(captureCharFrame()).toContain('Additional write directories: /work')
    renderer.destroy()
  })

  it('when backspace arrives, the previous char is deleted', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.directories.repoDirectory.insert('~/x')
    const { renderer, mockInput } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 8 },
    )

    mockInput.pressBackspace()

    expect(model.directories.repoDirectory.text.peek().text).toBe('~/')
    renderer.destroy()
  })

  it('when home then delete arrive, the first char is removed', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.directories.repoDirectory.insert('~/x')
    const { renderer, mockInput } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 8 },
    )

    mockInput.pressKey(KeyCodes.HOME)
    mockInput.pressKey(KeyCodes.DELETE)

    expect(model.directories.repoDirectory.text.peek().text).toBe('/x')
    renderer.destroy()
  })

  it('when left arrows arrive, typing inserts at the cursor', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.directories.repoDirectory.insert('~/x')
    const { renderer, mockInput } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 8 },
    )

    mockInput.pressArrow('left')
    mockInput.pressArrow('left')
    await mockInput.typeText('X')

    expect(model.directories.repoDirectory.text.peek().text).toBe('~X/x')
    renderer.destroy()
  })

  it('when home, end and right arrive, the cursor stays at the end', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.directories.repoDirectory.insert('~/x')
    const { renderer, mockInput } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 8 },
    )

    mockInput.pressKey(KeyCodes.HOME)
    mockInput.pressKey(KeyCodes.END)
    mockInput.pressArrow('right')

    expect(model.directories.repoDirectory.text.peek().cursor).toBe(3)
    renderer.destroy()
  })

  it('when right arrives on the confirm step, confirmation becomes false', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')
    const { renderer, mockInput } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 8 },
    )

    mockInput.pressArrow('right')

    expect(model.confirm.confirmed.peek()).toBe(false)
    renderer.destroy()
  })

  it('when left arrives on the confirm step, confirmation becomes true', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')
    model.confirm.choose(false)
    const { renderer, mockInput } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 8 },
    )

    mockInput.pressArrow('left')

    expect(model.confirm.confirmed.peek()).toBe(true)
    renderer.destroy()
  })

  it('when return arrives on the confirm step with yes, moves to the completeSetup step', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 10 })

    mockInput.pressEnter()
    await renderOnce()

    expect(model.step.current.peek()).toBe('completeSetup')
    expect(captureCharFrame()).toContain(
      '› Writing config to .crow/config.json',
    )
    expect(captureCharFrame()).toContain('  Creating ~/.crow')
    renderer.destroy()
  })

  it('when return arrives on the confirm step with no, exits without writing', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')
    model.confirm.choose(false)
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(<InstallApp model={model} />, {
      width: 70,
      height: 8,
      onDestroy,
    })

    mockInput.pressEnter()

    expect(model.step.current.peek()).toBe('confirm')
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when any key arrives on the done step, exits', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('done')
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(<InstallApp model={model} />, {
      width: 70,
      height: 8,
      onDestroy,
    })

    await mockInput.typeText('x')

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when ctrl-c arrives, exits', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(<InstallApp model={model} />, {
      width: 70,
      height: 8,
      onDestroy,
    })

    mockInput.pressCtrlC()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when a provider is added and escape finishes the loop, previews it and asks to confirm', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('allowedLocalScripts')
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, {
        width: 70,
        height: 40,
        kittyKeyboard: true,
      })

    mockInput.pressEnter()
    await mockInput.typeText('nous')
    mockInput.pressEnter()
    await mockInput.typeText('https://n')
    mockInput.pressEnter()
    await mockInput.typeText('sk-1')
    mockInput.pressEnter()
    mockInput.pressEscape()
    await renderOnce()

    const frame = captureCharFrame()
    expect(model.step.current.peek()).toBe('confirm')
    expect(frame).toContain('"providers": [')
    expect(frame).toContain('"name": "nous",')
    expect(frame).toContain('Complete setup?')
    expect(frame).not.toContain('sk-1')
    renderer.destroy()
  })

  it('when escape arrives outside the provider loop, keeps running', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { mockInput } = await testRender(<InstallApp model={model} />, {
      width: 70,
      height: 8,
      onDestroy,
      kittyKeyboard: true,
    })

    mockInput.pressEscape()

    expect(onDestroy).not.toHaveBeenCalled()
    expect(model.step.current.peek()).toBe('repo')
  })

  it('when the terminal is taller than the content, the question sits on the last row', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 8 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[7]).toContain('What directory for the local repo crow setup')
    renderer.destroy()
  })

  it('when the panel is tall, the question still sits on the last row', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('crowGlobalDirectory')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp model={model} />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[23]).toContain('User crow directory: (~/.crow)')
    renderer.destroy()
  })

  it('when down arrives on the confirm step, the select shows No', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')
    const { renderer, renderOnce, captureCharFrame, mockInput } =
      await testRender(<InstallApp model={model} />, { width: 70, height: 30 })

    mockInput.pressArrow('down')
    await renderOnce()

    expect(model.confirm.confirmed.peek()).toBe(false)
    expect(captureCharFrame()).toContain('▶ No')
    renderer.destroy()
  })
})
