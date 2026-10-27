import { describe, expect, it, mock, spyOn } from 'bun:test'
import { KeyCodes, createTestRenderer } from '@opentui/core/testing'
import {
  InstallTuiRunner,
  runInstallTui,
} from '../../../src/tui/install/runner.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockStdin } from '../../support/mock-streams.ts'

describe('runner', () => {
  it('when the renderer is destroyed, setup no longer starts', async () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const runner = new InstallTuiRunner(applicationData, {})
    const { renderer } = await createTestRenderer({ width: 70, height: 8 })
    runner.run()
    runner.view(renderer)
    renderer.destroy()
    runner.model().directories.repoDirectory.insert('/repo/injected')

    runner.model().step.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([])
  })

  it('when run, starts setup from the model once the step reaches completeSetup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const runner = new InstallTuiRunner(applicationData, {})
    runner.run()
    runner.model().directories.repoDirectory.insert('/repo/injected')

    runner.model().step.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['/repo/injected']])
  })

  it('when the install tui runs without a raw mode terminal, reports it was interrupted', async () => {
    const consoleError = mock()
    const runner = runInstallTui(mockApplicationData({ consoleError }), {
      stdin: mockStdin({ rawMode: false }),
    })

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(consoleError.mock.calls[0][0]).toBe(
      'Error: Crow unable to work in this terminal - TTY compatible stdin required.',
    )
  })

  describe('when viewed', () => {
    it('when rendered, shows the header and the repo directory question', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      const { renderer, renderOnce, captureCharFrame } =
        await createTestRenderer({ width: 70, height: 8 })
      runner.view(renderer)

      await renderOnce()

      expect(captureCharFrame()).toContain('Installing Crow Code')
      expect(captureCharFrame()).toContain('ctrl-c quit')
      expect(captureCharFrame()).toContain(
        'What directory for the local repo crow setup: (.crow)',
      )
      renderer.destroy()
    })

    it('when the step is past repo, shows the config preview', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('crowGlobalDirectory')
      const { renderer, renderOnce, captureCharFrame } =
        await createTestRenderer({ width: 70, height: 24 })
      runner.view(renderer)

      await renderOnce()

      expect(captureCharFrame()).toContain(
        'Installing repo config in: .crow/config.json',
      )
      expect(captureCharFrame()).toContain('"crowGlobalDirectory": "~/.crow"')
      renderer.destroy()
    })

    it('when text is typed, it becomes the repo directory and shows in the frame', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 8 })
      runner.view(renderer)

      await mockInput.typeText('./crow2')
      await renderOnce()

      expect(runner.model().directories.repoDirectory.text.peek().text).toBe(
        './crow2',
      )
      expect(captureCharFrame()).toContain('./crow2')
      renderer.destroy()
    })

    it('when return arrives, advances to the global directory question', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 24 })
      runner.view(renderer)

      mockInput.pressEnter()
      await renderOnce()

      expect(runner.model().step.current.peek()).toBe('crowGlobalDirectory')
      expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
      renderer.destroy()
    })

    it('when return arrives on the env file step, asks for ignored paths', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('envFile')
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 24 })
      runner.view(renderer)

      mockInput.pressEnter()
      await renderOnce()

      expect(runner.model().step.current.peek()).toBe('ignore')
      expect(captureCharFrame()).toContain('Ignored paths: []')
      renderer.destroy()
    })

    it('when text is typed on the ignore step, it shows in the frame', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('ignore')
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 24 })
      runner.view(renderer)

      await mockInput.typeText('.env')
      await renderOnce()

      expect(runner.model().permissions.ignore.text.peek().text).toBe('.env')
      expect(captureCharFrame()).toContain('Ignored paths: .env')
      renderer.destroy()
    })

    it('when return arrives on the additional read step, asks for additional write directories', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('additionalRead')
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 24 })
      runner.view(renderer)

      mockInput.pressEnter()
      await renderOnce()

      expect(runner.model().step.current.peek()).toBe('additionalWrite')
      expect(captureCharFrame()).toContain('Additional write directories: []')
      renderer.destroy()
    })

    it('when text is typed on the additional write step, it shows in the frame', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('additionalWrite')
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 24 })
      runner.view(renderer)

      await mockInput.typeText('/work')
      await renderOnce()

      expect(runner.model().permissions.additionalWrite.text.peek().text).toBe(
        '/work',
      )
      expect(captureCharFrame()).toContain(
        'Additional write directories: /work',
      )
      renderer.destroy()
    })

    it('when backspace arrives, the previous char is deleted', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().directories.repoDirectory.insert('~/x')
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
      })
      runner.view(renderer)

      mockInput.pressBackspace()

      expect(runner.model().directories.repoDirectory.text.peek().text).toBe(
        '~/',
      )
      renderer.destroy()
    })

    it('when home then delete arrive, the first char is removed', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().directories.repoDirectory.insert('~/x')
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
      })
      runner.view(renderer)

      mockInput.pressKey(KeyCodes.HOME)
      mockInput.pressKey(KeyCodes.DELETE)

      expect(runner.model().directories.repoDirectory.text.peek().text).toBe(
        '/x',
      )
      renderer.destroy()
    })

    it('when left arrows arrive, typing inserts at the cursor', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().directories.repoDirectory.insert('~/x')
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
      })
      runner.view(renderer)

      mockInput.pressArrow('left')
      mockInput.pressArrow('left')
      await mockInput.typeText('X')

      expect(runner.model().directories.repoDirectory.text.peek().text).toBe(
        '~X/x',
      )
      renderer.destroy()
    })

    it('when home, end and right arrive, the cursor stays at the end', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().directories.repoDirectory.insert('~/x')
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
      })
      runner.view(renderer)

      mockInput.pressKey(KeyCodes.HOME)
      mockInput.pressKey(KeyCodes.END)
      mockInput.pressArrow('right')

      expect(runner.model().directories.repoDirectory.text.peek().cursor).toBe(
        3,
      )
      renderer.destroy()
    })

    it('when right arrives on the confirm step, confirmation becomes false', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('confirm')
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
      })
      runner.view(renderer)

      mockInput.pressArrow('right')

      expect(runner.model().confirm.confirmed.peek()).toBe(false)
      renderer.destroy()
    })

    it('when left arrives on the confirm step, confirmation becomes true', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('confirm')
      runner.model().confirm.choose(false)
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
      })
      runner.view(renderer)

      mockInput.pressArrow('left')

      expect(runner.model().confirm.confirmed.peek()).toBe(true)
      renderer.destroy()
    })

    it('when return arrives on the confirm step with yes, moves to the completeSetup step', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('confirm')
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 10 })
      runner.view(renderer)

      mockInput.pressEnter()
      await renderOnce()

      expect(runner.model().step.current.peek()).toBe('completeSetup')
      expect(captureCharFrame()).toContain(
        '› Writing config to .crow/config.json',
      )
      expect(captureCharFrame()).toContain('  Creating ~/.crow')
      renderer.destroy()
    })

    it('when return arrives on the confirm step with no, exits without writing', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('confirm')
      runner.model().confirm.choose(false)
      const onDestroy = mock(() => {})
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
        onDestroy,
      })
      runner.view(renderer)

      mockInput.pressEnter()

      expect(runner.model().step.current.peek()).toBe('confirm')
      expect(onDestroy).toHaveBeenCalledTimes(1)
    })

    it('when any key arrives on the done step, exits', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('done')
      const onDestroy = mock(() => {})
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
        onDestroy,
      })
      runner.view(renderer)

      await mockInput.typeText('x')

      expect(onDestroy).toHaveBeenCalledTimes(1)
    })

    it('when ctrl-c arrives, exits', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      const onDestroy = mock(() => {})
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
        onDestroy,
      })
      runner.view(renderer)

      mockInput.pressCtrlC()

      expect(onDestroy).toHaveBeenCalledTimes(1)
    })

    it('when a provider is added and escape finishes the loop, previews it and asks to confirm', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('allowedLocalScripts')
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 40, kittyKeyboard: true })
      runner.view(renderer)

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
      expect(runner.model().step.current.peek()).toBe('confirm')
      expect(frame).toContain('"providers": [')
      expect(frame).toContain('"name": "nous",')
      expect(frame).toContain('Complete setup?')
      expect(frame).not.toContain('sk-1')
      renderer.destroy()
    })

    it('when escape arrives outside the provider loop, keeps running', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      const onDestroy = mock(() => {})
      const { renderer, mockInput } = await createTestRenderer({
        width: 70,
        height: 8,
        onDestroy,
        kittyKeyboard: true,
      })
      runner.view(renderer)

      mockInput.pressEscape()

      expect(onDestroy).not.toHaveBeenCalled()
      expect(runner.model().step.current.peek()).toBe('repo')
    })

    it('when the terminal is taller than the content, the question sits on the last row', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      const { renderer, renderOnce, captureCharFrame } =
        await createTestRenderer({ width: 70, height: 8 })
      runner.view(renderer)

      await renderOnce()

      const rows = captureCharFrame().split('\n')
      expect(rows[7]).toContain('What directory for the local repo crow setup')
      renderer.destroy()
    })

    it('when the panel is tall, the question still sits on the last row', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('crowGlobalDirectory')
      const { renderer, renderOnce, captureCharFrame } =
        await createTestRenderer({ width: 70, height: 24 })
      runner.view(renderer)

      await renderOnce()

      const rows = captureCharFrame().split('\n')
      expect(rows[23]).toContain('User crow directory: (~/.crow)')
      renderer.destroy()
    })

    it('when down arrives on the confirm step, the select shows No', async () => {
      const runner = new InstallTuiRunner(mockApplicationData(), {})
      runner.model().step.goTo('confirm')
      const { renderer, renderOnce, captureCharFrame, mockInput } =
        await createTestRenderer({ width: 70, height: 30 })
      runner.view(renderer)

      mockInput.pressArrow('down')
      await renderOnce()

      expect(runner.model().confirm.confirmed.peek()).toBe(false)
      expect(captureCharFrame()).toContain('▶ No')
      renderer.destroy()
    })
  })
})
