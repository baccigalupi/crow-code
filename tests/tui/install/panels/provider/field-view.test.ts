import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { createTestRenderer } from '@opentui/core/testing'
import { ProviderFieldView } from '../../../../../src/tui/install/panels/provider/field-view.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('ProviderFieldView', () => {
  it('when done, shows the typed value', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 30, height: 1 },
    )
    const view = new ProviderFieldView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'Name',
      input: insertText(emptyText(), 'or'),
      masked: false,
      status: 'done',
    })

    await renderOnce()

    expect(captureCharFrame()).toBe(' Name: or                     \n')
    renderer.destroy()
  })

  it('when pending, dims the bare label', async () => {
    const { renderer, renderOnce, captureSpans } = await createTestRenderer({
      width: 30,
      height: 1,
    })
    const view = new ProviderFieldView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'Url',
      input: emptyText(),
      masked: false,
      status: 'pending',
    })

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[1].text).toBe('Url:')
    expect(spans[1].attributes).toBe(TextAttributes.DIM)
    renderer.destroy()
  })

  it('when active and masked, never shows the value', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 30, height: 1 },
    )
    const view = new ProviderFieldView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'API key',
      input: insertText(emptyText(), 'sk-1'),
      masked: true,
      status: 'active',
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('API key: ••••')
    expect(captureCharFrame()).not.toContain('sk-1')
    renderer.destroy()
  })
})
