import { describe, expect, it } from 'bun:test'
import { rgbToHex } from '@opentui/core'
import { createTestRenderer } from '@opentui/core/testing'
import { ConfigPanelView } from '../../../../../src/tui/install/views/steps/config-panel.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('ConfigPanelView', () => {
  it('when the step is repo, renders nothing', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 24 },
    )
    const view = new ConfigPanelView(renderer)
    renderer.root.add(view.root())
    view.update({
      globalDirectory: emptyText(),
      repoDirectory: emptyText(),
      envFile: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      step: 'repo',
    })

    await renderOnce()

    expect(captureCharFrame().trim()).toBe('')
    renderer.destroy()
  })

  it('when past the repo step, shows the config path and json', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 24 },
    )
    const view = new ConfigPanelView(renderer)
    renderer.root.add(view.root())
    view.update({
      globalDirectory: emptyText(),
      repoDirectory: emptyText(),
      envFile: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      step: 'crowGlobalDirectory',
    })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    expect(captureCharFrame()).toContain('"crowGlobalDirectory": "~/.crow"')
    expect(captureCharFrame()).toContain('"envFile": "~/.crow/.env"')
    renderer.destroy()
  })

  it('when an env file is typed, shows it in the json', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 24 },
    )
    const view = new ConfigPanelView(renderer)
    renderer.root.add(view.root())
    view.update({
      globalDirectory: emptyText(),
      repoDirectory: emptyText(),
      envFile: insertText(emptyText(), '/secrets/crow.env'),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      step: 'envFile',
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('"envFile": "/secrets/crow.env"')
    renderer.destroy()
  })

  it('when a line is highlighted, draws it dark on gold', async () => {
    const { renderer, renderOnce, captureSpans } = await createTestRenderer({
      width: 70,
      height: 24,
    })
    const view = new ConfigPanelView(renderer)
    renderer.root.add(view.root())
    view.update({
      globalDirectory: emptyText(),
      repoDirectory: emptyText(),
      envFile: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      step: 'envFile',
    })

    await renderOnce()

    const highlighted = captureSpans().lines[5].spans[2]
    expect(highlighted.text).toBe('"envFile": "~/.crow/.env",')
    expect(rgbToHex(highlighted.fg)).toBe('#0a0f1e')
    expect(rgbToHex(highlighted.bg)).toBe('#e6ca6c')
    renderer.destroy()
  })

  describe('when highlighting the line the step edits', () => {
    it('when the step is providerUrl, highlights the draft provider baseUrl', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 40,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: insertText(emptyText(), 'd'),
        providerUrl: insertText(emptyText(), 'https://d'),
        providerCredentials: emptyText(),
        providers: [{ name: 'nous', url: 'https://n' }],
        step: 'providerUrl',
      })

      await renderOnce()

      expect(captureSpans().lines[27].spans[2].text).toBe(
        '"baseUrl": "https://d"',
      )
      renderer.destroy()
    })

    it('when the step is providerName, highlights the draft provider name', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 40,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: insertText(emptyText(), 'd'),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [{ name: 'nous', url: 'https://n' }],
        step: 'providerName',
      })

      await renderOnce()

      expect(captureSpans().lines[26].spans[2].text).toBe('"name": "d",')
      renderer.destroy()
    })

    it('when the step is crowGlobalDirectory, highlights the crowGlobalDirectory line', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'crowGlobalDirectory',
      })

      await renderOnce()

      expect(captureSpans().lines[4].spans[2].text).toBe(
        '"crowGlobalDirectory": "~/.crow",',
      )
      renderer.destroy()
    })

    it('when the step is ignore, highlights the ignore line', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'ignore',
      })

      await renderOnce()

      expect(captureSpans().lines[7].spans[2].text).toBe('"ignore": [],')
      renderer.destroy()
    })

    it('when the step is ignore and paths are typed, highlights the whole ignore array', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: insertText(emptyText(), '.env'),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'ignore',
      })

      await renderOnce()

      const { lines } = captureSpans()
      expect(lines[7].spans[2].text).toBe('"ignore": [')
      expect(lines[8].spans[2].text).toBe('      ".env"')
      expect(lines[9].spans[2].text).toBe('    ],')
      renderer.destroy()
    })

    it('when the step is additionalRead, highlights the additionalRead line', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'additionalRead',
      })

      await renderOnce()

      expect(captureSpans().lines[8].spans[2].text).toBe(
        '"additionalRead": [],',
      )
      renderer.destroy()
    })

    it('when the step is additionalWrite and a path is typed, highlights the whole additionalWrite array', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: insertText(emptyText(), '/work'),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'additionalWrite',
      })

      await renderOnce()

      const { lines } = captureSpans()
      expect(lines[9].spans[2].text).toBe('"additionalWrite": [')
      expect(lines[10].spans[2].text).toBe('      "/work"')
      expect(lines[11].spans[2].text).toBe('    ],')
      renderer.destroy()
    })

    it('when the step is escalateRead, highlights the escalateRead line', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'escalateRead',
      })

      await renderOnce()

      expect(captureSpans().lines[10].spans[2].text).toBe('"escalateRead": [],')
      renderer.destroy()
    })

    it('when the step is escalateWrite, highlights the whole escalateWrite array', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'escalateWrite',
      })

      await renderOnce()

      const { lines } = captureSpans()
      expect(lines[11].spans[2].text).toBe('"escalateWrite": [')
      expect(lines[12].spans[2].text).toBe('      "./dev",')
      expect(lines[13].spans[2].text).toBe('      "./agent"')
      expect(lines[14].spans[2].text).toBe('    ],')
      renderer.destroy()
    })

    it('when the step is confirm, highlights nothing', async () => {
      const { renderer, renderOnce, captureSpans } = await createTestRenderer({
        width: 70,
        height: 24,
      })
      const view = new ConfigPanelView(renderer)
      renderer.root.add(view.root())
      view.update({
        globalDirectory: emptyText(),
        repoDirectory: emptyText(),
        envFile: emptyText(),
        ignore: emptyText(),
        additionalRead: emptyText(),
        additionalWrite: emptyText(),
        escalateRead: emptyText(),
        escalateWrite: emptyText(),
        allowedLocalScripts: emptyText(),
        providerName: emptyText(),
        providerUrl: emptyText(),
        providerCredentials: emptyText(),
        providers: [],
        step: 'confirm',
      })

      await renderOnce()

      expect(captureSpans().lines[5].spans[1].text).toBe(
        '    "envFile": "~/.crow/.env",         ',
      )
      renderer.destroy()
    })
  })
})
