import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { createTestRenderer } from '@opentui/core/testing'
import { ProviderFieldView } from '../../../../../src/tui/install/views/steps/provider-field.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('ProviderFieldView', () => {
  it('when its step is done, shows the typed value', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 30, height: 1 },
    )
    const view = new ProviderFieldView(renderer, {
      label: 'Name',
      input: 'providerName',
      masked: false,
    })
    renderer.root.add(view.root())
    view.update({
      step: 'providerUrl',
      providers: [],
      providerName: insertText(emptyText(), 'or'),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    })

    await renderOnce()

    expect(captureCharFrame()).toBe(' Name: or                     \n')
    renderer.destroy()
  })

  it('when its step is later, dims the bare label', async () => {
    const { renderer, renderOnce, captureSpans } = await createTestRenderer({
      width: 30,
      height: 1,
    })
    const view = new ProviderFieldView(renderer, {
      label: 'Url',
      input: 'providerUrl',
      masked: false,
    })
    renderer.root.add(view.root())
    view.update({
      step: 'providerName',
      providers: [],
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    })

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[1].text).toBe('Url:')
    expect(spans[1].attributes).toBe(TextAttributes.DIM)
    renderer.destroy()
  })

  it('when the credential is done, never shows it', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 30, height: 1 },
    )
    const view = new ProviderFieldView(renderer, {
      label: 'API key',
      input: 'providerCredentials',
      masked: true,
    })
    renderer.root.add(view.root())
    view.update({
      step: 'providerCredentials',
      providers: [],
      providerName: insertText(emptyText(), 'or'),
      providerUrl: insertText(emptyText(), 'https://o'),
      providerCredentials: insertText(emptyText(), 'sk-1'),
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('API key: ••••')
    expect(captureCharFrame()).not.toContain('sk-1')
    renderer.destroy()
  })
})
